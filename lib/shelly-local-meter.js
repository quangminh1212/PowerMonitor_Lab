import { createHash, randomBytes } from "node:crypto";
import { Agent, request as httpsRequest } from "node:https";
import { isIPv4 } from "node:net";
import { connect as tlsConnect } from "node:tls";

const defaultPort = 80;
const pollIntervalMs = 3_000;
const requestTimeoutMs = 1_000;
const maximumResponseBytes = 64 * 1024;
const meterReadingId = "shelly-pc-input";
const componentKeyPattern = /^(?:pm1|switch):\d+$/;
const statusPath = "/rpc/Shelly.GetStatus";
const deviceInfoPath = "/rpc/Shelly.GetDeviceInfo";

class ShellyLocalHttpsAgent extends Agent {
  #expectedFingerprint;
  #onCertificate;

  constructor({ expectedFingerprint, onCertificate }) {
    super({ keepAlive: false, maxCachedSessions: 0 });
    this.#expectedFingerprint = expectedFingerprint;
    this.#onCertificate = onCertificate;
  }

  createConnection(options, callback) {
    if (typeof callback !== "function") {
      throw new Error("Shelly HTTPS requires an asynchronous TLS handshake.");
    }

    const socket = tlsConnect({
      ...options,
      rejectUnauthorized: false,
      minVersion: "TLSv1.2",
      maxVersion: "TLSv1.2",
      maxCachedSessions: 0
    });
    let settled = false;
    const finish = (error, connectedSocket) => {
      if (settled) return;
      settled = true;
      callback(error, connectedSocket);
    };

    socket.once("secureConnect", () => {
      const fingerprint = normalizeCertificateFingerprint(socket.getPeerCertificate()?.fingerprint256);
      this.#onCertificate(fingerprint);
      if (!fingerprint) {
        const error = new Error("The Shelly HTTPS certificate fingerprint is unavailable.");
        error.code = "SHELLY_CERTIFICATE_UNAVAILABLE";
        socket.destroy();
        finish(error);
        return;
      }
      if (this.#expectedFingerprint && fingerprint !== this.#expectedFingerprint) {
        const error = new Error("The Shelly HTTPS certificate changed.");
        error.code = "SHELLY_CERTIFICATE_CHANGED";
        socket.destroy();
        finish(error);
        return;
      }
      finish(null, socket);
    });
    socket.once("error", (error) => finish(error));
    return undefined;
  }
}

async function requestShellyHttps(url, {
  authorization,
  signal,
  expectedFingerprint,
  onCertificate
}) {
  const agent = new ShellyLocalHttpsAgent({ expectedFingerprint, onCertificate });
  try {
    const incoming = await new Promise((resolve, reject) => {
      const request = httpsRequest(url, {
        method: "GET",
        headers: {
          accept: "application/json",
          ...(authorization ? { authorization } : {})
        },
        agent,
        signal
      }, resolve);
      request.once("error", reject);
      request.end();
    });
    const body = await readHttpsResponseBody(incoming);
    const headers = new Headers();
    for (const [name, value] of Object.entries(incoming.headers)) {
      if (value !== undefined) headers.set(name, Array.isArray(value) ? value.join(", ") : String(value));
    }
    const status = Number(incoming.statusCode);
    if (!Number.isInteger(status) || status < 200 || status > 599) {
      throw new Error("The Shelly HTTPS response had an invalid status.");
    }
    return {
      response: new Response(body.length > 0 && status !== 204 && status !== 304 ? body : null, {
        status,
        statusText: incoming.statusMessage,
        headers
      })
    };
  } finally {
    agent.destroy();
  }
}

async function readHttpsResponseBody(response) {
  const chunks = [];
  let byteLength = 0;
  for await (const chunk of response) {
    byteLength += chunk.byteLength;
    if (byteLength > maximumResponseBytes) {
      response.destroy();
      throw new Error("The Shelly status response was too large.");
    }
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function parseShellyHttpsRedirect(location, address, requestPath) {
  if (typeof location !== "string" || location.length > 2_048) return null;
  let target;
  try {
    target = new URL(location, `http://${address.hostname}:${address.port}${requestPath}`);
  } catch {
    return null;
  }
  if (target.protocol !== "https:" || target.hostname !== address.hostname ||
      target.username || target.password || target.pathname !== requestPath || target.search || target.hash) {
    return null;
  }
  return target;
}

function normalizeCertificateFingerprint(value) {
  const fingerprint = typeof value === "string" ? value.replaceAll(":", "").trim().toLocaleLowerCase("en-US") : "";
  return /^[a-f0-9]{64}$/.test(fingerprint) ? fingerprint : null;
}

function formatCertificateFingerprint(value) {
  const fingerprint = normalizeCertificateFingerprint(value);
  return fingerprint ? fingerprint.match(/.{2}/g).join(":").toLocaleUpperCase("en-US") : null;
}

function normalizeShellyDeviceId(value) {
  if (typeof value !== "string") return null;
  const deviceId = value.trim().toLocaleLowerCase("en-US");
  return /^[a-z0-9][a-z0-9._-]{0,127}$/.test(deviceId) ? deviceId : null;
}

function isCanonicalShellyDeviceId(value) {
  return typeof value === "string" && /^shelly[a-z0-9]*-[a-f0-9]{6,12}$/.test(value);
}

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
  if (!fields || (fields.algorithm && fields.algorithm.toLocaleUpperCase("en-US") !== "SHA-256") ||
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
  #httpsMode = false;
  #httpsUrl = null;
  #trustedCertificateFingerprint = null;
  #observedCertificateFingerprint = null;
  #expectedDeviceId = null;
  #deviceId = null;
  #authRealm = null;
  #identityVerified = false;
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
  #secureRequest;
  #componentId;
  #invalidComponentId = false;
  #snapshot;

  constructor({ address, password, componentId, certificateFingerprint, expectedDeviceId, onSnapshot = () => {}, requestTimeoutMs: timeoutMs = requestTimeoutMs, secureRequest = requestShellyHttps } = {}) {
    this.#address = parseShellyMeterAddress(address);
    this.#password = typeof password === "string" ? password : "";
    this.#trustedCertificateFingerprint = normalizeCertificateFingerprint(certificateFingerprint);
    this.#expectedDeviceId = normalizeShellyDeviceId(expectedDeviceId);
    const requestedComponentId = typeof componentId === "string" ? componentId.trim() : "";
    this.#invalidComponentId = requestedComponentId.length > 0 && !componentKeyPattern.test(requestedComponentId);
    this.#componentId = requestedComponentId && !this.#invalidComponentId ? requestedComponentId : null;
    this.#onSnapshot = typeof onSnapshot === "function" ? onSnapshot : () => {};
    this.#secureRequest = typeof secureRequest === "function" ? secureRequest : requestShellyHttps;
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

  configure({ address, password = "", componentId = "", certificateFingerprint, expectedDeviceId } = {}) {
    if (this.#closed) return false;
    this.#controller?.abort();
    this.#controller = null;
    const nextAddress = parseShellyMeterAddress(address);
    const sameAddress = nextAddress && this.#address?.hostname === nextAddress.hostname &&
      this.#address?.port === nextAddress.port;
    if (!sameAddress) {
      this.#httpsMode = false;
      this.#httpsUrl = null;
      this.#trustedCertificateFingerprint = null;
      this.#observedCertificateFingerprint = null;
      this.#deviceId = null;
      this.#authRealm = null;
      this.#identityVerified = false;
    }
    this.#address = nextAddress;
    const requestedFingerprint = normalizeCertificateFingerprint(certificateFingerprint);
    if (requestedFingerprint && requestedFingerprint !== this.#trustedCertificateFingerprint) {
      this.#deviceId = null;
      this.#authRealm = null;
      this.#identityVerified = false;
      this.#nonce = null;
      this.#nonceCount = 0;
      this.#trustedCertificateFingerprint = requestedFingerprint;
    }
    if (expectedDeviceId !== undefined) {
      const nextExpectedDeviceId = normalizeShellyDeviceId(expectedDeviceId);
      if (this.#expectedDeviceId !== nextExpectedDeviceId) {
        this.#deviceId = null;
        this.#authRealm = null;
        this.#identityVerified = false;
      }
      this.#expectedDeviceId = nextExpectedDeviceId;
    }
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
      const initial = await this.#request();
      if (initial.reason) return this.#publish(this.#unavailableSnapshot(initial.reason));
      let response = initial.response;
      if (response.status === 401) {
        const challenge = parseDigestChallenge(response.headers.get("www-authenticate"));
        await discardBody(response);
        if (!this.#password) {
          this.#retryAfter = Date.now() + 30_000;
          return this.#publish(this.#unavailableSnapshot("authentication-required"));
        }
        if (!challenge) return this.#publishAuthFailure();

        const identity = await this.#verifyDeviceIdentity();
        if (identity.reason) return this.#publish(this.#unavailableSnapshot(identity.reason));
        if (!this.#authRealm || challenge.realm.toLocaleLowerCase("en-US") !== this.#authRealm) {
          return this.#publish(this.#unavailableSnapshot("identity-mismatch"));
        }
        if (!this.#nonce || this.#nonce.nonce !== challenge.nonce || challenge.stale === "true") {
          this.#setChallenge(challenge);
        }

        const authorized = await this.#request(this.#nextAuthorization());
        if (authorized.reason) return this.#publish(this.#unavailableSnapshot(authorized.reason));
        response = authorized.response;
        if (response.status === 401) {
          const freshChallenge = parseDigestChallenge(response.headers.get("www-authenticate"));
          await discardBody(response);
          if (!freshChallenge || freshChallenge.stale !== "true" ||
              freshChallenge.realm.toLocaleLowerCase("en-US") !== this.#authRealm) {
            return this.#publishAuthFailure();
          }
          this.#setChallenge(freshChallenge);
          const retried = await this.#request(this.#nextAuthorization());
          if (retried.reason) return this.#publish(this.#unavailableSnapshot(retried.reason));
          response = retried.response;
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
        sampledAtUtc: reading.sampledAtUtc,
        certificateFingerprint: formatCertificateFingerprint(this.#trustedCertificateFingerprint)
      });
    } catch (error) {
      if (error?.code === "SHELLY_CERTIFICATE_CHANGED") {
        return this.#publish(this.#unavailableSnapshot("certificate-changed"));
      }
      return this.#publish(this.#unavailableSnapshot("unreachable"));
    } finally {
      this.#controller = null;
      this.#polling = false;
    }
  }

  async #verifyDeviceIdentity() {
    if (this.#identityVerified) return { reason: null };
    const result = await this.#request(null, deviceInfoPath);
    if (result.reason) return { reason: result.reason };
    if (!result.response.ok) {
      await discardBody(result.response);
      return { reason: "identity-verification-failed" };
    }

    let payload;
    try {
      payload = await readJsonResponse(result.response);
    } catch {
      return { reason: "identity-verification-failed" };
    }
    const info = payload?.result && typeof payload.result === "object" ? payload.result
      : payload?.params && typeof payload.params === "object" ? payload.params
        : payload;
    const deviceId = normalizeShellyDeviceId(info?.id);
    const authRealm = normalizeShellyDeviceId(info?.auth_domain ?? info?.id);
    if (!deviceId || !authRealm) return { reason: "identity-verification-failed" };
    if (authRealm !== deviceId) return { reason: "identity-mismatch" };
    if (isCanonicalShellyDeviceId(this.#expectedDeviceId) && this.#expectedDeviceId !== deviceId) {
      return { reason: "identity-mismatch" };
    }
    this.#deviceId = deviceId;
    this.#authRealm = authRealm;
    this.#identityVerified = true;
    return { reason: null };
  }

  #isConfigured() {
    return this.#address !== null && !this.#invalidComponentId;
  }

  #configurationReason() {
    if (this.#invalidComponentId) return "invalid-component-id";
    return this.#isConfigured() ? null : "not-configured";
  }

  async #request(authorization = null, path = statusPath) {
    const controller = new AbortController();
    this.#controller = controller;
    const timeout = setTimeout(() => controller.abort(), this.#requestTimeoutMs);
    timeout.unref?.();
    try {
      if (this.#httpsMode) {
        const url = this.#httpsUrl
          ? new URL(path, this.#httpsUrl)
          : new URL(`https://${this.#address.hostname}${path}`);
        return await this.#requestOverHttps(authorization, controller.signal, url);
      }

      const url = `http://${this.#address.hostname}:${this.#address.port}${path}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          accept: "application/json",
          ...(authorization ? { authorization } : {})
        },
        redirect: "manual",
        signal: controller.signal
      });
      if (![301, 302, 303, 307, 308].includes(response.status)) {
        return { response, secure: false, reason: null };
      }

      const secureUrl = parseShellyHttpsRedirect(response.headers.get("location"), this.#address, path);
      await discardBody(response);
      if (!secureUrl) return { response: null, secure: false, reason: "unsafe-redirect" };
      this.#httpsMode = true;
      this.#httpsUrl = secureUrl;
      this.#nonce = null;
      this.#nonceCount = 0;
      return await this.#requestOverHttps(null, controller.signal, secureUrl);
    } finally {
      clearTimeout(timeout);
    }
  }

  async #requestOverHttps(authorization, signal, url) {
    const result = await this.#secureRequest(url, {
      authorization: this.#trustedCertificateFingerprint ? authorization : null,
      signal,
      expectedFingerprint: this.#trustedCertificateFingerprint,
      onCertificate: (fingerprint) => { this.#observedCertificateFingerprint = fingerprint; }
    });
    if (!this.#trustedCertificateFingerprint) {
      await discardBody(result.response);
      return { ...result, secure: true, reason: "certificate-trust-required" };
    }
    return { ...result, secure: true, reason: null };
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
    return {
      available: false,
      configured: this.#isConfigured(),
      reason,
      readings: [],
      sampledAtUtc: null,
      certificateFingerprint: formatCertificateFingerprint(this.#observedCertificateFingerprint)
    };
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
