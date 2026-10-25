import { appendFile, mkdir, readdir, readFile, unlink } from "node:fs/promises";
import path from "node:path";
import { getDataDirectory } from "./store.js";

const schemaVersion = 1;
const maximumPowerWatts = 100_000;
const millisecondsPerDay = 24 * 60 * 60 * 1_000;

export const automaticHistorySampleIntervalMs = 30_000;
export const automaticHistoryRetentionDays = 7;

export class SensorHistoryStore {
  #directory;
  #sampleIntervalMs;
  #retentionDays;
  #lastRecorded = new Map();
  #lastPrunedAt = 0;
  #pending = Promise.resolve();

  constructor({
    directory = path.join(getDataDirectory(), "sensor-history"),
    sampleIntervalMs = automaticHistorySampleIntervalMs,
    retentionDays = automaticHistoryRetentionDays
  } = {}) {
    if (!Number.isFinite(sampleIntervalMs) || sampleIntervalMs < 1_000) {
      throw new RangeError("The automatic sensor history interval must be at least one second.");
    }
    if (!Number.isInteger(retentionDays) || retentionDays < 1 || retentionDays > 30) {
      throw new RangeError("Automatic sensor history retention must be between 1 and 30 days.");
    }
    this.#directory = path.resolve(directory);
    this.#sampleIntervalMs = sampleIntervalMs;
    this.#retentionDays = retentionDays;
  }

  recordSnapshot(snapshot) {
    return this.#exclusive(() => this.#recordSnapshotUnlocked(snapshot));
  }

  getHistory({ from, to }) {
    return this.#exclusive(() => this.#getHistoryUnlocked(from, to));
  }

  close() {
    return this.#pending;
  }

  #exclusive(operation) {
    const result = this.#pending.then(operation, operation);
    this.#pending = result.then(() => undefined, () => undefined);
    return result;
  }

  async #recordSnapshotUnlocked(snapshot) {
    if (!Array.isArray(snapshot?.readings)) return 0;

    const candidates = [];
    for (const reading of snapshot.readings) {
      if (!isAutomaticReading(reading)) continue;
      const sampledAtUtc = validTimestamp(reading.sampledAtUtc) ?? validTimestamp(snapshot.sampledAtUtc);
      if (!sampledAtUtc) continue;
      const sampledAtMs = Date.parse(sampledAtUtc);
      const sensorId = reading.id.trim();
      const source = reading.source.trim();
      const key = `${source}\u0000${sensorId}`;
      const previousSampledAt = this.#lastRecorded.get(key);
      if (previousSampledAt !== undefined &&
          (sampledAtMs <= previousSampledAt || sampledAtMs - previousSampledAt < this.#sampleIntervalMs)) {
        continue;
      }

      candidates.push({
        key,
        sampledAtMs,
        fileDate: sampledAtUtc.slice(0, 10),
        entry: {
          schemaVersion,
          sensorId,
          name: reading.name.trim(),
          kind: reading.kind,
          device: typeof reading.device === "string" ? reading.device : null,
          source,
          watts: reading.watts,
          sampledAtUtc
        }
      });
    }

    if (candidates.length === 0) return 0;

    await mkdir(this.#directory, { recursive: true, mode: 0o700 });
    const byDate = new Map();
    for (const candidate of candidates) {
      const entries = byDate.get(candidate.fileDate) ?? [];
      entries.push(candidate.entry);
      byDate.set(candidate.fileDate, entries);
    }
    for (const [date, entries] of byDate) {
      const filePath = path.join(this.#directory, `${date}.jsonl`);
      const content = `${entries.map((entry) => JSON.stringify(entry)).join("\n")}\n`;
      await appendFile(filePath, content, { encoding: "utf8", mode: 0o600 });
    }
    for (const candidate of candidates) {
      this.#lastRecorded.set(candidate.key, candidate.sampledAtMs);
    }

    await this.#pruneExpiredFiles(Date.now());
    return candidates.length;
  }

  async #getHistoryUnlocked(from, to) {
    if (!Number.isFinite(from) || !Number.isFinite(to) || from > to) {
      throw new TypeError("A valid sensor history time range is required.");
    }
    await this.#pruneExpiredFiles(Date.now());

    let fileNames;
    try {
      fileNames = await readdir(this.#directory);
    } catch (error) {
      if (error.code === "ENOENT") return [];
      throw error;
    }

    const firstDate = new Date(from).toISOString().slice(0, 10);
    const lastDate = new Date(to).toISOString().slice(0, 10);
    const targetFiles = fileNames
      .filter((name) => /^\d{4}-\d{2}-\d{2}\.jsonl$/.test(name))
      .filter((name) => {
        const date = name.slice(0, 10);
        return date >= firstDate && date <= lastDate;
      })
      .sort();

    const samples = [];
    for (const name of targetFiles) {
      const content = await readFile(path.join(this.#directory, name), "utf8");
      for (const line of content.split(/\r?\n/)) {
        if (!line) continue;
        let entry;
        try {
          entry = JSON.parse(line);
        } catch {
          continue;
        }
        const sampledAtMs = Date.parse(entry?.sampledAtUtc);
        if (entry?.schemaVersion === schemaVersion &&
            typeof entry.sensorId === "string" &&
            Number.isFinite(entry.watts) &&
            Number.isFinite(sampledAtMs) && sampledAtMs >= from && sampledAtMs <= to) {
          samples.push(entry);
        }
      }
    }

    return samples.sort((left, right) =>
      Date.parse(left.sampledAtUtc) - Date.parse(right.sampledAtUtc) ||
      left.sensorId.localeCompare(right.sensorId)
    );
  }

  async #pruneExpiredFiles(now) {
    if (now - this.#lastPrunedAt < millisecondsPerDay) return;
    const oldestDate = new Date(now - this.#retentionDays * millisecondsPerDay)
      .toISOString()
      .slice(0, 10);
    let fileNames;
    try {
      fileNames = await readdir(this.#directory);
    } catch (error) {
      if (error.code === "ENOENT") {
        this.#lastPrunedAt = now;
        return;
      }
      throw error;
    }
    await Promise.all(fileNames
      .filter((name) => /^\d{4}-\d{2}-\d{2}\.jsonl$/.test(name))
      .filter((name) => name.slice(0, 10) < oldestDate)
      .map((name) => unlink(path.join(this.#directory, name)).catch((error) => {
        if (error.code !== "ENOENT") throw error;
      })));
    this.#lastPrunedAt = now;
  }
}

export function automaticHistoryRangeBounds(range, now = Date.now()) {
  const duration = {
    "1h": 60 * 60 * 1_000,
    "6h": 6 * 60 * 60 * 1_000,
    "24h": millisecondsPerDay,
    "7d": 7 * millisecondsPerDay
  }[range] ?? millisecondsPerDay;
  return { from: now - duration, to: now };
}

function validTimestamp(value) {
  return typeof value === "string" && Number.isFinite(Date.parse(value))
    ? new Date(value).toISOString()
    : null;
}

function isAutomaticReading(reading) {
  return reading !== null && typeof reading === "object" &&
    typeof reading.id === "string" && reading.id.trim().length > 0 &&
    typeof reading.name === "string" && reading.name.trim().length > 0 &&
    typeof reading.source === "string" && reading.source.trim().length > 0 &&
    Number.isFinite(reading.watts) && reading.watts >= 0 && reading.watts <= maximumPowerWatts;
}
