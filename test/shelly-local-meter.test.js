import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createServer } from "node:http";
import test from "node:test";

async function loadAdapter() {
  try {
    return await import("../lib/shelly-local-meter.js");
  } catch (error) {
    assert.fail(`The Shelly local-meter adapter should exist: ${error.message}`);
  }
}

test("accepts only private or loopback IPv4 meter addresses", async () => {
  const { parseShellyMeterAddress } = await loadAdapter();

  assert.deepEqual(parseShellyMeterAddress("192.168.1.20"), {
    hostname: "192.168.1.20",
    port: 80
  });
  assert.deepEqual(parseShellyMeterAddress("127.0.0.1:19080"), {
    hostname: "127.0.0.1",
    port: 19080
  });
  assert.equal(parseShellyMeterAddress("8.8.8.8"), null);
  assert.equal(parseShellyMeterAddress("shelly.local"), null);
});

test("does not contact the network when no PC meter is configured", async () => {
  const { ShellyLocalMeterSource } = await loadAdapter();
  const originalFetch = globalThis.fetch;
  let requestCount = 0;
  globalThis.fetch = async () => {
    requestCount += 1;
    throw new Error("An unconfigured meter must never be contacted.");
  };
  const source = new ShellyLocalMeterSource();

  try {
    const snapshot = await source.pollOnce();
    assert.equal(snapshot.available, false);
    assert.equal(snapshot.configured, false);
    assert.equal(requestCount, 0);
  } finally {
    source.close();
    globalThis.fetch = originalFetch;
  }
});

test("parses a Shelly PM1 reading as whole-PC active power and energy", async () => {
  const { parseShellyStatus } = await loadAdapter();
  const sampledAtUtc = "2026-10-25T14:00:00.000Z";

  const reading = parseShellyStatus({
    id: 0,
    result: {
      "pm1:0": {
        voltage: 230.2,
        current: 0.41,
        apower: 86.7,
        pf: 0.92,
        aenergy: { total: 173.25 }
      }
    }
  }, sampledAtUtc);

  assert.deepEqual(reading, {
    id: "shelly-pc-input",
    name: "PC input power",
    kind: "system",
    watts: 86.7,
    absoluteEnergyWh: 173.25,
    voltage: 230.2,
    current: 0.41,
    powerFactor: 0.92,
    source: "Shelly local power meter",
    method: "Read-only active power at the dedicated PC outlet",
    sampledAtUtc
  });
});

test("falls back to the first Shelly switch component without estimating watts", async () => {
  const { parseShellyStatus } = await loadAdapter();

  const reading = parseShellyStatus({
    "switch:0": { apower: 42.5, aenergy: { total: 9.75 } }
  }, "2026-10-25T14:00:00.000Z");

  assert.equal(reading?.watts, 42.5);
  assert.equal(reading?.absoluteEnergyWh, 9.75);
  assert.equal(reading?.source, "Shelly local power meter");
});

test("requires an exact outlet channel when a meter exposes multiple channels", async () => {
  const { parseShellyStatus } = await loadAdapter();
  const payload = {
    "pm1:0": { apower: 31, aenergy: { total: 4 } },
    "pm1:1": { apower: 82, aenergy: { total: 9 } }
  };

  assert.equal(parseShellyStatus(payload), null);
  assert.equal(parseShellyStatus(payload, undefined, "pm1:1")?.watts, 82);
  assert.equal(parseShellyStatus(payload, undefined, "pm1:2"), null);
});

test("rejects Shelly error states and invalid power values", async () => {
  const { parseShellyStatus } = await loadAdapter();

  assert.equal(parseShellyStatus({ "pm1:0": { apower: -1 } }), null);
  assert.equal(parseShellyStatus({ "pm1:0": { apower: "NaN" } }), null);
  assert.equal(parseShellyStatus({
    "pm1:0": { apower: 5, errors: ["power_meter_failure"] }
  }), null);
});

test("builds the SHA-256 digest response for the exact read-only HTTP request", async () => {
  const { createShellyDigestAuthorization } = await loadAdapter();
  const uri = "/rpc/Shelly.GetStatus";
  const challenge = 'Digest realm="shelly-test", nonce="nonce-1", algorithm=SHA-256, qop="auth"';
  const header = createShellyDigestAuthorization({
    challenge,
    method: "GET",
    uri,
    password: "secret",
    nonceCount: 1,
    clientNonce: "deadbeef"
  });
  const hash = (value) => createHash("sha256").update(value).digest("hex");
  const ha1 = hash("admin:shelly-test:secret");
  const ha2 = hash(`GET:${uri}`);
  const response = hash(`${ha1}:nonce-1:00000001:deadbeef:auth:${ha2}`);

  assert.match(header, /^Digest username="admin"/);
  assert.match(header, /algorithm=SHA-256/);
  assert.match(header, /qop=auth/);
  assert.match(header, new RegExp(`response="${response}"`));
});

test("polls only Shelly.GetStatus and retries an enabled Digest challenge", async () => {
  const { ShellyLocalMeterSource } = await loadAdapter();
  let authorizationHeader = null;
  const server = createServer((request, response) => {
    assert.equal(request.method, "GET");
    assert.equal(request.url, "/rpc/Shelly.GetStatus");
    if (!request.headers.authorization) {
      response.writeHead(401, {
        "WWW-Authenticate": 'Digest realm="shelly-test", nonce="nonce-2", algorithm=SHA-256, qop="auth"'
      });
      response.end();
      return;
    }

    authorizationHeader = request.headers.authorization;
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({
      id: 0,
      result: {
        "pm1:0": { apower: 11.5, aenergy: { total: 4.5 } },
        "pm1:1": { apower: 65.25, aenergy: { total: 12.5 } }
      }
    }));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  const source = new ShellyLocalMeterSource({
    address: `127.0.0.1:${address.port}`,
    password: "secret",
    componentId: "pm1:1",
    requestTimeoutMs: 500
  });

  try {
    const snapshot = await source.pollOnce();
    assert.equal(snapshot.available, true);
    assert.equal(snapshot.readings[0].watts, 65.25);
    assert.match(authorizationHeader, /nonce="nonce-2"/);
    assert.match(authorizationHeader, /response="[a-f0-9]{64}"/);
  } finally {
    source.close();
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});
