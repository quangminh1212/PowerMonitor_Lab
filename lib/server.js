import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  automaticHistoryRangeBounds,
  automaticHistoryRetentionDays,
  automaticHistoryMaximumGapMs,
  automaticHistorySampleIntervalMs,
  SensorHistoryStore
} from "./sensor-history.js";
import { aggregateEnergyHistory, energyHistoryRangeBounds } from "./energy-history.js";
import { ComputerSensorMonitor } from "./sensors.js";

const loopbackAddress = "127.0.0.1";
const maximumMeterConfigurationBytes = 4 * 1024;
const webRoot = fileURLToPath(new URL("../web/", import.meta.url));
const staticFiles = new Map([
  ["/", { file: "index.html", type: "text/html; charset=utf-8" }],
  ["/index.html", { file: "index.html", type: "text/html; charset=utf-8" }],
  ["/app.css", { file: "app.css", type: "text/css; charset=utf-8" }],
  ["/app.js", { file: "app.js", type: "text/javascript; charset=utf-8" }]
]);

export async function startLocalApp({
  port = 0,
  sensors: providedSensors,
  historyDirectory,
  historyPollIntervalMs = 5_000
} = {}) {
  const sensorHistory = new SensorHistoryStore(historyDirectory ? { directory: historyDirectory } : undefined);
  const sensors = providedSensors ?? new ComputerSensorMonitor();
  const recordSensorHistory = async () => {
    try {
      await sensorHistory.recordSnapshot(sensors.getSnapshot());
    } catch (error) {
      console.error(`Automatic sensor history could not be saved: ${error.message}`);
    }
  };
  await recordSensorHistory();
  const historyTimer = setInterval(() => void recordSensorHistory(), historyPollIntervalMs);
  historyTimer.unref();
  const server = createServer((request, response) => {
    void handleRequest(request, response, sensors, sensorHistory).catch((error) => {
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
    clearInterval(historyTimer);
    sensors.close();
    await sensorHistory.close();
    throw error;
  }

  const address = server.address();
  if (!address || typeof address === "string") {
    clearInterval(historyTimer);
    sensors.close();
    await sensorHistory.close();
    await closeServer(server);
    throw new Error("The local server did not report its listening address.");
  }

  return {
    server,
    origin: `http://${loopbackAddress}:${address.port}`,
    close: async () => {
      clearInterval(historyTimer);
      sensors.close();
      await sensorHistory.close();
      await closeServer(server);
    }
  };
}

async function handleRequest(request, response, sensors, sensorHistory) {
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

  if (url.pathname === "/api/meter/configure" && method === "POST") {
    const configuration = await readJsonBody(request, maximumMeterConfigurationBytes);
    if (typeof sensors.configurePcMeter !== "function" || !sensors.configurePcMeter(configuration)) {
      throw new HttpError(400, "Choose a meter discovered on this local network.");
    }
    sendJson(response, 200, sensors.getSnapshot());
    return;
  }

  if (url.pathname === "/api/history" && (method === "GET" || method === "HEAD")) {
    const range = ["1h", "6h", "24h", "7d"].includes(url.searchParams.get("range"))
      ? url.searchParams.get("range")
      : "24h";
    const bounds = automaticHistoryRangeBounds(range);
    const samples = await sensorHistory.getHistory(bounds);
    sendJson(response, 200, {
      range,
      fromUtc: new Date(bounds.from).toISOString(),
      toUtc: new Date(bounds.to).toISOString(),
      sampleIntervalSeconds: automaticHistorySampleIntervalMs / 1_000,
      retentionDays: automaticHistoryRetentionDays,
      samples
    }, method === "HEAD");
    return;
  }

  if (url.pathname === "/api/energy-history" && (method === "GET" || method === "HEAD")) {
    const range = ["1h", "24h", "7d", "30d"].includes(url.searchParams.get("range"))
      ? url.searchParams.get("range")
      : "24h";
    const bounds = energyHistoryRangeBounds(range);
    const samples = await sensorHistory.getHistory({
      from: bounds.from - automaticHistoryMaximumGapMs,
      to: bounds.to
    });
    const history = aggregateEnergyHistory(samples, {
      range,
      ...bounds,
      sampleIntervalMs: automaticHistorySampleIntervalMs,
      maximumGapMs: automaticHistoryMaximumGapMs
    });
    sendJson(response, 200, {
      ...history,
      retentionDays: automaticHistoryRetentionDays
    }, method === "HEAD");
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

async function readJsonBody(request, maximumBytes) {
  if (!request.headers["content-type"]?.toLocaleLowerCase("en-US").startsWith("application/json")) {
    throw new HttpError(415, "A JSON request body is required.");
  }
  const chunks = [];
  let byteLength = 0;
  for await (const chunk of request) {
    byteLength += chunk.byteLength;
    if (byteLength > maximumBytes) throw new HttpError(413, "The request body is too large.");
    chunks.push(Buffer.from(chunk));
  }
  try {
    const value = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("invalid object");
    return value;
  } catch {
    throw new HttpError(400, "The JSON request body is invalid.");
  }
}

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
