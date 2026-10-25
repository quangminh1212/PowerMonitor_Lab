import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { rangeBounds, summarize } from "./metrics.js";
import { ComputerSensorMonitor } from "./sensors.js";
import { ReadingStore } from "./store.js";

const loopbackAddress = "127.0.0.1";
const maximumJsonBytes = 16 * 1024;
const maximumReadingsInResponse = 2_000;
const processSessionId = randomUUID();
const webRoot = fileURLToPath(new URL("../web/", import.meta.url));
const staticFiles = new Map([
  ["/", { file: "index.html", type: "text/html; charset=utf-8" }],
  ["/index.html", { file: "index.html", type: "text/html; charset=utf-8" }],
  ["/app.css", { file: "app.css", type: "text/css; charset=utf-8" }],
  ["/app.js", { file: "app.js", type: "text/javascript; charset=utf-8" }]
]);

export async function startLocalApp({ port = 0 } = {}) {
  const store = new ReadingStore();
  const sensors = new ComputerSensorMonitor();
  const server = createServer((request, response) => {
    void handleRequest(request, response, store, sensors).catch((error) => {
      if (response.headersSent) {
        response.destroy(error);
        return;
      }

      const status = error instanceof HttpError ? error.status : 500;
      sendJson(response, status, {
        error: status === 500 ? "The local request failed." : error.message
      });
      if (status === 500) console.error(`Local request failed: ${error.message}`);
    });
  });

  server.headersTimeout = 10_000;
  server.requestTimeout = 30_000;
  server.keepAliveTimeout = 5_000;

  try {
    await new Promise((resolve, reject) => {
      const onError = (error) => reject(error);
      server.once("error", onError);
      server.listen(port, loopbackAddress, () => {
        server.off("error", onError);
        resolve();
      });
    });
  } catch (error) {
    sensors.close();
    throw error;
  }

  const address = server.address();
  if (!address || typeof address === "string") {
    sensors.close();
    await closeServer(server);
    throw new Error("The local server did not report its listening address.");
  }

  return {
    server,
    origin: `http://${loopbackAddress}:${address.port}`,
    close: async () => {
      sensors.close();
      await closeServer(server);
    }
  };
}

async function handleRequest(request, response, store, sensors) {
  addSecurityHeaders(response);

  const address = request.socket.remoteAddress;
  if (address !== loopbackAddress) throw new HttpError(403, "This app is available only on this computer.");

  const listeningPort = request.socket.localPort;
  const expectedHost = `${loopbackAddress}:${listeningPort}`;
  if (request.headers.host?.toLowerCase() !== expectedHost) {
    throw new HttpError(400, "The request host does not match this local app.");
  }

  const method = request.method ?? "GET";
  if (method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE") {
    if (request.headers.origin !== `http://${expectedHost}`) {
      throw new HttpError(403, "The request origin does not match this local app.");
    }
  }

  let url;
  try {
    url = new URL(request.url ?? "/", `http://${expectedHost}`);
  } catch {
    throw new HttpError(400, "The request URL is invalid.");
  }

  if (url.pathname === "/health" && (method === "GET" || method === "HEAD")) {
    sendJson(response, 200, { status: "ok", product: "Power Monitor Lab" }, method === "HEAD");
    return;
  }

  if (url.pathname === "/api/sensors" && (method === "GET" || method === "HEAD")) {
    sendJson(response, 200, sensors.getSnapshot(), method === "HEAD");
    return;
  }

  if (url.pathname === "/api/meters" && (method === "GET" || method === "HEAD")) {
    const readings = await store.getAll();
    const meters = [...new Set(readings.map((reading) => reading.meterName))]
      .sort((left, right) => left.localeCompare(right, "en", { sensitivity: "base" }));
    sendJson(response, 200, meters, method === "HEAD");
    return;
  }

  if (url.pathname === "/api/readings" && (method === "GET" || method === "HEAD")) {
    const readings = await store.getAll();
    const { from, to } = rangeBounds(url.searchParams.get("range"));
    const selected = filterByMeter(readings, url.searchParams.get("meter"))
      .filter((reading) => {
        const recordedAt = Date.parse(reading.recordedAtUtc);
        return Number.isFinite(recordedAt) && recordedAt >= from && recordedAt <= to;
      })
      .sort((left, right) => Date.parse(right.recordedAtUtc) - Date.parse(left.recordedAtUtc))
      .slice(0, maximumReadingsInResponse);
    sendJson(response, 200, selected, method === "HEAD");
    return;
  }

  if (url.pathname === "/api/summary" && (method === "GET" || method === "HEAD")) {
    const readings = await store.getAll();
    const { from, to } = rangeBounds(url.searchParams.get("range"));
    sendJson(response, 200, summarize(readings, url.searchParams.get("meter"), from, to), method === "HEAD");
    return;
  }

  if (url.pathname === "/api/readings" && method === "POST") {
    const input = await readJsonBody(request);
    const meterName = typeof input?.meterName === "string" ? input.meterName.trim() : "";
    const watts = input?.watts;
    const note = input?.note;

    if (typeof watts !== "number" || !Number.isFinite(watts) || watts < 0 || watts > 100_000) {
      throw new HttpError(400, "Enter a power value between 0 and 100,000 W.");
    }
    if (!meterName || meterName.length > 100) {
      throw new HttpError(400, "Enter a meter or device name up to 100 characters.");
    }
    if (note !== undefined && note !== null && typeof note !== "string") {
      throw new HttpError(400, "The note must be text.");
    }
    if (typeof note === "string" && note.length > 250) {
      throw new HttpError(400, "Keep notes to 250 characters or fewer.");
    }

    const reading = {
      id: randomUUID(),
      schemaVersion: 1,
      meterName,
      watts,
      recordedAtUtc: new Date().toISOString(),
      sessionId: processSessionId,
      monotonicTimestampNanoseconds: process.hrtime.bigint().toString(),
      source: "Manual reading",
      note: typeof note === "string" ? note.trim() : null
    };

    await store.add(reading);
    sendJson(response, 201, reading, false, { Location: `/api/readings/${reading.id}` });
    return;
  }

  if (url.pathname === "/api/readings" && method === "DELETE") {
    await store.deleteAll();
    sendEmpty(response, 204);
    return;
  }

  const readingMatch = /^\/api\/readings\/([0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i.exec(url.pathname);
  if (readingMatch && method === "DELETE") {
    const removed = await store.delete(readingMatch[1]);
    sendEmpty(response, removed ? 204 : 404);
    return;
  }

  if (url.pathname === "/api/export.csv" && (method === "GET" || method === "HEAD")) {
    const readings = await store.getAll();
    const { from, to } = rangeBounds(url.searchParams.get("range"));
    const selected = filterByMeter(readings, url.searchParams.get("meter"))
      .filter((reading) => {
        const recordedAt = Date.parse(reading.recordedAtUtc);
        return Number.isFinite(recordedAt) && recordedAt >= from && recordedAt <= to;
      })
      .sort((left, right) => Date.parse(left.recordedAtUtc) - Date.parse(right.recordedAtUtc));
    sendCsv(response, selected, method === "HEAD");
    return;
  }

  const asset = staticFiles.get(url.pathname);
  if (asset && (method === "GET" || method === "HEAD")) {
    const content = await readFile(path.join(webRoot, asset.file));
    response.writeHead(200, {
      "Content-Type": asset.type,
      "Content-Length": content.byteLength,
      "Cache-Control": "no-store"
    });
    response.end(method === "HEAD" ? undefined : content);
    return;
  }

  if (asset) {
    response.setHeader("Allow", "GET, HEAD");
    throw new HttpError(405, "This local resource does not support that method.");
  }

  throw new HttpError(404, "The requested local resource was not found.");
}

async function readJsonBody(request) {
  const mediaType = request.headers["content-type"]?.split(";", 1)[0].trim().toLowerCase();
  if (mediaType !== "application/json") throw new HttpError(415, "Send this request as application/json.");

  const declaredLength = Number(request.headers["content-length"] ?? 0);
  if (declaredLength > maximumJsonBytes) throw new HttpError(413, "The request body is too large.");

  const chunks = [];
  let bytes = 0;
  for await (const chunk of request) {
    bytes += chunk.byteLength;
    if (bytes > maximumJsonBytes) throw new HttpError(413, "The request body is too large.");
    chunks.push(chunk);
  }

  try {
    const value = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("A JSON object is required.");
    }
    return value;
  } catch (error) {
    throw new HttpError(400, `The JSON body is invalid: ${error.message}`);
  }
}

function filterByMeter(readings, meter) {
  if (!meter?.trim()) return readings;
  const wanted = meter.trim().toLocaleLowerCase("en-US");
  return readings.filter((reading) => reading.meterName.toLocaleLowerCase("en-US") === wanted);
}

function sendJson(response, status, value, head = false, additionalHeaders = {}) {
  const content = Buffer.from(JSON.stringify(value), "utf8");
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": content.byteLength,
    "Cache-Control": "no-store",
    ...additionalHeaders
  });
  response.end(head ? undefined : content);
}

function sendEmpty(response, status) {
  response.writeHead(status, { "Content-Length": 0, "Cache-Control": "no-store" });
  response.end();
}

function sendCsv(response, readings, head) {
  const rows = [[
    "schema_version",
    "reading_id",
    "recorded_at_utc",
    "session_id",
    "monotonic_timestamp_nanoseconds",
    "meter",
    "watts",
    "unit",
    "source",
    "note"
  ].join(",")];

  for (const reading of readings) {
    rows.push([
      String(reading.schemaVersion),
      csvCell(reading.id),
      csvCell(reading.recordedAtUtc),
      csvCell(reading.sessionId),
      csvCell(reading.monotonicTimestampNanoseconds ?? ""),
      csvCell(reading.meterName),
      String(reading.watts),
      "W",
      csvCell(reading.source),
      csvCell(reading.note ?? "")
    ].join(","));
  }

  const content = Buffer.from(`\uFEFF${rows.join("\r\n")}\r\n`, "utf8");
  response.writeHead(200, {
    "Content-Type": "text/csv; charset=utf-8",
    "Content-Disposition": 'attachment; filename="power-monitor-readings.csv"',
    "Content-Length": content.byteLength,
    "Cache-Control": "no-store"
  });
  response.end(head ? undefined : content);
}

function csvCell(value) {
  const text = String(value ?? "");
  const firstMeaningfulCharacter = text.replace(/^\uFEFF/, "").trimStart();
  const safeText = firstMeaningfulCharacter.length > 0 && "=+-@".includes(firstMeaningfulCharacter[0])
    ? `'${text}`
    : text;
  return `"${safeText.replaceAll('"', '""')}"`;
}

function addSecurityHeaders(response) {
  response.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'");
  response.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  response.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.setHeader("Referrer-Policy", "no-referrer");
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");
}

function closeServer(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
    server.closeIdleConnections?.();
  });
}

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
