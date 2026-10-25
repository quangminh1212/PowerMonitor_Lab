import { createHash, randomBytes } from "node:crypto";
import { isIPv4 } from "node:net";

const defaultPort = 80;
const pollIntervalMs = 3_000;
const requestTimeoutMs = 1_000;
const maximumResponseBytes = 64 * 1024;
const meterReadingId = "shelly-pc-input";
const componentKeyPattern = /^(?:pm1|switch):\d+$/;

export function parseShellyMeterAddress(value) {
  const match = /^(\d{1,3}(?:\.\d{1,3}){3})(?::(\d{1,5}))?$/.exec(String(value ?? "").trim());
  if (!match || !isIPv4(match[1])) return null;

  const octets = match[1].split(".").map(Number);
  const [first, second] = octets;
  const isLoopback = first === 127;
  const isPrivate = first === 10 ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168) ||
    (first === 169 && second === 254);
  if (!isLoopback && !isPrivate) return null;

  const port = match[2] === undefined ? defaultPort : Number(match[2]);
  if (!Number.isSafeInteger(port) || port < 1 || port > 65_535) return null;
  return { hostname: match[1], port };
}

export function parseShellyStatus(payload, sampledAtUtc = new Date().toISOString(), componentId = null) {
  const component = selectShellyPowerComponent(payload, componentId).component;
  if (!component) return null;

  const watts = finiteNumber(component.apower);
  const absoluteEnergyWh = finiteNumber(component.aenergy?.total);
  const voltage = finiteNumber(component.voltage);
  const current = finiteNumber(component.current);
  const powerFactor = finiteNumber(component.pf);
  return {
    id: meterReadingId,
    name: "PC input power",
    kind: "system",
    watts,
    absoluteEnergyWh: absoluteEnergyWh !== null && absoluteEnergyWh >= 0 ? absoluteEnergyWh : null,
    voltage: voltage !== null && voltage > 0 ? voltage : null,
    current: current !== null && current >= 0 ? current : null,
    powerFactor: powerFactor !== null && powerFactor >= 0 && powerFactor <= 1 ? powerFactor : null,
    source: "Shelly local power meter",
    method: "Read-only active power at the dedicated PC outlet",
    sampledAtUtc
  };
}

function selectShellyPowerComponent(payload, requestedComponentId = null) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { component: null, reason: "invalid-response" };
  }
  if (requestedComponentId !== null && !componentKeyPattern.test(requestedComponentId)) {
    return { component: null, reason: "invalid-component-id" };
  }

  const result = payload.result && typeof payload.result === "object" && !Array.isArray(payload.result)
    ? payload.result
    : payload.params && typeof payload.params === "object" && !Array.isArray(payload.params)
      ? payload.params
      : payload;
  const entries = Object.entries(result)
    .filter(([key, value]) => componentKeyPattern.test(key) &&
      value !== null && typeof value === "object" && !Array.isArray(value) &&
      (!Array.isArray(value.errors) || value.errors.length === 0) &&
      finiteNumber(value.apower) !== null && finiteNumber(value.apower) >= 0 &&
      finiteNumber(value.apower) <= 100_000)
    .sort(([left], [right]) => {
      const leftType = left.startsWith("pm1:") ? 0 : 1;
      const rightType = right.startsWith("pm1:") ? 0 : 1;
      return leftType - rightType || Number(left.split(":")[1]) - Number(right.split(":")[1]);
    });

  if (requestedComponentId) {
    const selected = entries.find(([key]) => key === requestedComponentId);
    return selected
      ? { component: selected[1], reason: null }
      : { component: null, reason: "selected-component-unavailable" };
  }

  const channelIndexes = new Set(entries.map(([key]) => Number(key.split(":")[1])));
  if (channelIndexes.size > 1) return { component: null, reason: "multiple-meter-channels" };
  return entries.length > 0
    ? { component: entries[0][1], reason: null }
    : { component: null, reason: "no-power-channel" };
}

export function createShellyDigestAuthorization({
  challenge,
  method,
  uri,
  password,
  nonceCount,
  clientNonce
}) {
  const fields = parseDigestChallenge(challenge);
  if (!fields || fields.algorithm?.toLocaleUpperCase("en-US") !== "SHA-256" ||
      !fields.realm || !fields.nonce || !fields.qop?.split(",").map((item) => item.trim()).includes("auth") ||
      !method || !uri || typeof password !== "string" || password.length === 0 ||
      !Number.isSafeInteger(nonceCount) || nonceCount < 1 || nonceCount > 0xffff_ffff ||
      !/^[a-f0-9]{8,32}$/i.test(String(clientNonce ?? ""))) {
    return null;
  }

  const nc = nonceCount.toString(16).padStart(8, "0");
  const ha1 = sha256(`admin:${fields.realm}:${password}`);
  const ha2 = sha256(`${method}:${uri}`);
  const response = sha256(`${ha1}:${fields.nonce}:${nc}:${clientNonce}:auth:${ha2}`);
  const values = [
    `username=${quoteDigest("admin")}`,
    `realm=${quoteDigest(fields.realm)}`,
    `nonce=${quoteDigest(fields.nonce)}`,
    `uri=${quoteDigest(uri)}`,
    "algorithm=SHA-256",
    `response=${quoteDigest(response)}`,
    "qop=auth",
    `nc=${nc}`,
    `cnonce=${quoteDigest(clientNonce)}`
  ];
  if (fields.opaque) values.push(`opaque=${quoteDigest(fields.opaque)}`);
  return `Digest ${values.join(", ")}`;
}

export class ShellyLocalMeterSource {
  #address;
  #password;
  #onSnapshot;
  #timer = null;
  #controller = null;
  #closed = false;
  #polling = false;
  #nonce = null;
  #nonceCount = 0;
  #authFailures = 0;
  #retryAfter = 0;
  #requestTimeoutMs;
  #componentId;
  #invalidComponentId = false;
  #snapshot;

  constructor({ address, password, componentId, onSnapshot = () => {}, requestTimeoutMs: timeoutMs = requestTimeoutMs } = {}) {
    this.#address = parseShellyMeterAddress(address);
    this.#password = typeof password === "string" ? password : "";
    const requestedComponentId = typeof componentId === "string" ? componentId.trim() : "";
    this.#invalidComponentId = requestedComponentId.length > 0 && !componentKeyPattern.test(requestedComponentId);
    this.#componentId = requestedComponentId && !this.#invalidComponentId ? requestedComponentId : null;
    this.#onSnapshot = typeof onSnapshot === "function" ? onSnapshot : () => {};
    this.#requestTimeoutMs = Number.isSafeInteger(timeoutMs) && timeoutMs > 0 ? timeoutMs : requestTimeoutMs;
    this.#snapshot = this.#unavailableSnapshot();
  }

  start() {
    if (this.#closed || this.#timer) return;
    this.#publish(this.#unavailableSnapshot(this.#configurationReason() ?? "waiting"));
    if (!this.#isConfigured()) return;
    void this.pollOnce();
    this.#timer = setInterval(() => void this.pollOnce(), pollIntervalMs);
    this.#timer.unref?.();
  }

  close() {
    this.#closed = true;
    if (this.#timer) clearInterval(this.#timer);
    this.#timer = null;
    this.#controller?.abort();
    this.#controller = null;
  }

  configure({ address, password = "", componentId = "" } = {}) {
    if (this.#closed) return false;
    this.#controller?.abort();
    this.#controller = null;
    this.#address = parseShellyMeterAddress(address);
    this.#password = typeof password === "string" ? password.slice(0, 256) : "";
    const requestedComponentId = typeof componentId === "string" ? componentId.trim() : "";
    this.#invalidComponentId = requestedComponentId.length > 0 && !componentKeyPattern.test(requestedComponentId);
    this.#componentId = requestedComponentId && !this.#invalidComponentId ? requestedComponentId : null;
    this.#nonce = null;
    this.#nonceCount = 0;
    this.#authFailures = 0;
    this.#retryAfter = 0;
    this.#snapshot = this.#unavailableSnapshot(this.#configurationReason() ?? "waiting");
    if (this.#isConfigured()) {
      if (this.#timer) void this.pollOnce();
      else this.start();
    } else {
      this.#publish(this.#snapshot);
    }
    return true;
  }

  async pollOnce() {
    if (this.#closed) return this.#snapshot;
    if (!this.#isConfigured()) return this.#publish(this.#unavailableSnapshot(this.#configurationReason()));
    if (this.#polling || Date.now() < this.#retryAfter) return this.#snapshot;

    this.#polling = true;
    try {
      let response;
      if (this.#nonce) {
        response = await this.#request(this.#nextAuthorization());
        if (response.status === 401) {
          const challenge = parseDigestChallenge(response.headers.get("www-authenticate"));
          await discardBody(response);
          if (!challenge || (challenge.nonce === this.#nonce.nonce && challenge.stale !== "true")) {
            return this.#publishAuthFailure();
          }
          this.#setChallenge(challenge);
          response = await this.#request(this.#nextAuthorization());
        }
      } else {
        response = await this.#request();
        if (response.status === 401) {
          const challenge = parseDigestChallenge(response.headers.get("www-authenticate"));
          await discardBody(response);
          if (!this.#password) {
            this.#retryAfter = Date.now() + 30_000;
            return this.#publish(this.#unavailableSnapshot("authentication-required"));
          }
          if (!challenge) return this.#publishAuthFailure();
          this.#setChallenge(challenge);
          response = await this.#request(this.#nextAuthorization());
        }
      }

      if (!response.ok) {
        await discardBody(response);
        if (response.status === 401 || response.status === 429) return this.#publishAuthFailure();
        return this.#publish(this.#unavailableSnapshot());
      }

      const payload = await readJsonResponse(response);
      const selection = selectShellyPowerComponent(payload, this.#componentId);
      if (!selection.component) return this.#publish(this.#unavailableSnapshot(selection.reason));
      const reading = parseShellyStatus(payload, new Date().toISOString(), this.#componentId);
      this.#authFailures = 0;
      this.#retryAfter = 0;
      return this.#publish({
        available: true,
        configured: true,
        readings: [reading],
        sampledAtUtc: reading.sampledAtUtc
      });
    } catch {
      return this.#publish(this.#unavailableSnapshot("unreachable"));
    } finally {
      this.#controller = null;
      this.#polling = false;
    }
  }

  #isConfigured() {
    return this.#address !== null && !this.#invalidComponentId;
  }

  #configurationReason() {
    if (this.#invalidComponentId) return "invalid-component-id";
    return this.#isConfigured() ? null : "not-configured";
  }

  #request(authorization = null) {
    const controller = new AbortController();
    this.#controller = controller;
    const timeout = setTimeout(() => controller.abort(), this.#requestTimeoutMs);
    timeout.unref?.();
    const url = `http://${this.#address.hostname}:${this.#address.port}/rpc/Shelly.GetStatus`;
    return fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        ...(authorization ? { authorization } : {})
      },
      redirect: "error",
      signal: controller.signal
    }).finally(() => clearTimeout(timeout));
  }

  #setChallenge(challenge) {
    this.#nonce = challenge;
    this.#nonceCount = 0;
  }

  #nextAuthorization() {
    this.#nonceCount += 1;
    return createShellyDigestAuthorization({
      challenge: serializeDigestChallenge(this.#nonce),
      method: "GET",
      uri: "/rpc/Shelly.GetStatus",
      password: this.#password,
      nonceCount: this.#nonceCount,
      clientNonce: randomBytes(8).toString("hex")
    });
  }

  #publishAuthFailure() {
    this.#authFailures += 1;
    this.#retryAfter = Date.now() + Math.min(this.#authFailures * 60_000, 600_000);
    return this.#publish(this.#unavailableSnapshot("authentication-failed"));
  }

  #unavailableSnapshot(reason = "unavailable") {
    return { available: false, configured: this.#isConfigured(), reason, readings: [], sampledAtUtc: null };
  }

  #publish(snapshot) {
    this.#snapshot = snapshot;
    if (!this.#closed) this.#onSnapshot(snapshot);
    return snapshot;
  }
}

function parseDigestChallenge(value) {
  if (typeof value !== "string") return null;
  const prefix = /^Digest\s+/i.exec(value);
  if (!prefix) return null;
  const fields = {};
  for (const match of value.slice(prefix[0].length).matchAll(/([a-zA-Z][\w-]*)=(?:"((?:\\.|[^"])*)"|([^,\s]+))/g)) {
    const [, name, quoted, bare] = match;
    fields[name.toLocaleLowerCase("en-US")] = (quoted ?? bare ?? "").replaceAll(/\\(.)/g, "$1");
  }
  return fields.realm && fields.nonce ? fields : null;
}

function serializeDigestChallenge(fields) {
  if (!fields) return "";
  return `Digest ${Object.entries(fields).map(([key, value]) =>
    `${key}=${quoteDigest(value)}`
  ).join(", ")}`;
}

function quoteDigest(value) {
  return `"${String(value).replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
}

function sha256(value) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function finiteNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

async function readJsonResponse(response) {
  if (!response.headers.get("content-type")?.toLocaleLowerCase("en-US").includes("json")) {
    await discardBody(response);
    throw new Error("The Shelly status response was not JSON.");
  }

  const contentLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > maximumResponseBytes) {
    await discardBody(response);
    throw new Error("The Shelly status response was too large.");
  }

  if (!response.body) throw new Error("The Shelly status response was empty.");
  const chunks = [];
  let byteLength = 0;
  for await (const chunk of response.body) {
    byteLength += chunk.byteLength;
    if (byteLength > maximumResponseBytes) {
      await response.body.cancel();
      throw new Error("The Shelly status response was too large.");
    }
    chunks.push(Buffer.from(chunk));
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function discardBody(response) {
  await response.body?.cancel().catch(() => {});
}
