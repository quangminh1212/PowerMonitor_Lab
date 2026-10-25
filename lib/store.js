import { randomUUID } from "node:crypto";
import { open, mkdir, readFile, rename, unlink } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";

const schemaVersion = 1;

export function getDataDirectory() {
  const configured = process.env.POWER_MONITOR_DATA_DIR?.trim();
  if (configured) return path.resolve(configured);

  if (process.platform === "win32") {
    const root = process.env.LOCALAPPDATA || process.env.APPDATA || path.join(homedir(), "AppData", "Local");
    return path.join(root, "PowerMonitorLab");
  }

  if (process.platform === "darwin") {
    return path.join(homedir(), "Library", "Application Support", "PowerMonitorLab");
  }

  return path.join(process.env.XDG_DATA_HOME || path.join(homedir(), ".local", "share"), "power-monitor-lab");
}

export class ReadingStore {
  #filePath;
  #pending = Promise.resolve();

  constructor(filePath = path.join(getDataDirectory(), "readings.json")) {
    this.#filePath = filePath;
  }

  getAll() {
    return this.#exclusive(() => this.#readUnlocked());
  }

  delete(id) {
    return this.#exclusive(async () => {
      const readings = await this.#readUnlocked();
      const remaining = readings.filter((reading) => reading.id !== id);
      if (remaining.length === readings.length) return false;
      await this.#writeUnlocked(remaining);
      return true;
    });
  }

  deleteAll() {
    return this.#exclusive(() => this.#writeUnlocked([]));
  }

  #exclusive(operation) {
    const result = this.#pending.then(operation, operation);
    this.#pending = result.then(() => undefined, () => undefined);
    return result;
  }

  async #readUnlocked() {
    let text;
    try {
      text = await readFile(this.#filePath, "utf8");
    } catch (error) {
      if (error.code === "ENOENT") return [];
      throw error;
    }

    let document;
    try {
      document = JSON.parse(text);
    } catch (error) {
      throw new Error(`The local readings file is not valid JSON: ${error.message}`, { cause: error });
    }

    if (document?.schemaVersion !== schemaVersion || !Array.isArray(document.readings)) {
      throw new Error("The local readings file has an unsupported schema. Back it up before replacing it.");
    }
    if (!document.readings.every(isPowerReading)) {
      throw new Error("The local readings file contains an invalid reading. Back it up before replacing it.");
    }

    return document.readings;
  }

  async #writeUnlocked(readings) {
    const directory = path.dirname(this.#filePath);
    await mkdir(directory, { recursive: true, mode: 0o700 });
    const temporaryPath = `${this.#filePath}.${process.pid}.${randomUUID()}.tmp`;
    const handle = await open(temporaryPath, "wx", 0o600);

    try {
      await handle.writeFile(JSON.stringify({ schemaVersion, readings }, null, 2), "utf8");
      await handle.sync();
    } catch (error) {
      await handle.close();
      await unlink(temporaryPath).catch(() => {});
      throw error;
    }

    await handle.close();
    try {
      await rename(temporaryPath, this.#filePath);
    } catch (error) {
      await unlink(temporaryPath).catch(() => {});
      throw error;
    }
  }
}

function isPowerReading(reading) {
  return reading !== null && typeof reading === "object" &&
    typeof reading.id === "string" &&
    reading.schemaVersion === schemaVersion &&
    typeof reading.meterName === "string" && reading.meterName.trim().length > 0 &&
    typeof reading.watts === "number" && Number.isFinite(reading.watts) && reading.watts >= 0 && reading.watts <= 100_000 &&
    typeof reading.recordedAtUtc === "string" && Number.isFinite(Date.parse(reading.recordedAtUtc)) &&
    typeof reading.sessionId === "string" &&
    typeof reading.source === "string" &&
    (reading.note === null || typeof reading.note === "string");
}
