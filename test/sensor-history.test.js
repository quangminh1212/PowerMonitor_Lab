import assert from "node:assert/strict";
import { mkdir, mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { startLocalApp } from "../lib/server.js";

function reading(watts, sampledAtUtc, id = "cpu-package") {
  return {
    id,
    name: id,
    kind: "processor",
    watts,
    sampledAtUtc,
    source: "Windows Energy Metering Interface (EMI)"
  };
}

async function temporaryDirectory(t) {
  const directory = await mkdtemp(path.join(os.tmpdir(), "power-monitor-history-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return directory;
}

test("stores finite automatic sensor samples at a bounded cadence", async (t) => {
  const directory = await temporaryDirectory(t);
  let historyModule;
  try {
    historyModule = await import("../lib/sensor-history.js");
  } catch (error) {
    assert.fail(`The automatic sensor history store should exist: ${error.message}`);
  }
  assert.equal(typeof historyModule.SensorHistoryStore, "function");
  const { SensorHistoryStore } = historyModule;
  const store = new SensorHistoryStore({ directory, sampleIntervalMs: 30_000 });
  const start = Date.parse("2026-10-25T10:00:00.000Z");

  assert.equal(await store.recordSnapshot({ readings: [
    reading(24.5, new Date(start).toISOString()),
    reading(null, new Date(start).toISOString(), "waiting-sensor")
  ] }), 1);
  assert.equal(await store.recordSnapshot({ readings: [
    reading(28.1, new Date(start + 10_000).toISOString())
  ] }), 0);
  assert.equal(await store.recordSnapshot({ readings: [
    reading(31.2, new Date(start + 30_000).toISOString())
  ] }), 1);

  const samples = await store.getHistory({ from: start - 1, to: start + 30_000 });
  assert.deepEqual(samples.map(({ watts }) => watts), [24.5, 31.2]);
  assert.equal(samples[0].sensorId, "cpu-package");
  assert.equal(samples[0].sampledAtUtc, new Date(start).toISOString());
  const restartedStore = new SensorHistoryStore({ directory, sampleIntervalMs: 30_000 });
  assert.deepEqual(await restartedStore.getHistory({ from: start - 1, to: start + 30_000 }), samples);
});

test("prunes expired daily files when history is read", async (t) => {
  const directory = await temporaryDirectory(t);
  await mkdir(directory, { recursive: true });
  const expiredAtUtc = new Date(Date.now() - 3 * 24 * 60 * 60 * 1_000).toISOString();
  const expiredFile = `${expiredAtUtc.slice(0, 10)}.jsonl`;
  await writeFile(path.join(directory, expiredFile), `${JSON.stringify({
    schemaVersion: 1,
    sensorId: "old-sensor",
    name: "Old sensor",
    kind: "processor",
    device: "CPU",
    source: "Windows EMI",
    watts: 12,
    sampledAtUtc: expiredAtUtc
  })}\n`, "utf8");

  const store = new (await import("../lib/sensor-history.js")).SensorHistoryStore({
    directory,
    retentionDays: 1
  });
  await store.getHistory({
    from: Date.now() - 2 * 24 * 60 * 60 * 1_000,
    to: Date.now()
  });
  assert.equal((await readdir(directory)).includes(expiredFile), false);
});

test("serves automatically collected local history and rejects manual watt posts", async (t) => {
  const directory = await temporaryDirectory(t);
  const sampledAtUtc = new Date().toISOString();
  const sensors = {
    getSnapshot: () => ({ readings: [reading(36.4, sampledAtUtc)] }),
    close() {}
  };
  const app = await startLocalApp({
    port: 0,
    sensors,
    historyDirectory: directory,
    historyPollIntervalMs: 60_000
  });
  t.after(() => app.close());

  const response = await fetch(`${app.origin}/api/history?range=1h`);
  assert.equal(response.status, 200);
  const history = await response.json();
  assert.equal(history.samples.length, 1);
  assert.equal(history.samples[0].watts, 36.4);

  const manualResponse = await fetch(`${app.origin}/api/readings`, {
    method: "POST",
    headers: { Origin: app.origin, "Content-Type": "application/json" },
    body: JSON.stringify({ watts: 999 })
  });
  assert.equal(manualResponse.status, 404);
});
