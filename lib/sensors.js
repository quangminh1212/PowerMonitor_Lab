import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const powershellScript = fileURLToPath(new URL("./windows-sensors.ps1", import.meta.url));
const maximumLineBytes = 512 * 1024;

function normalizeDeviceName(value) {
  return String(value ?? "").trim().toLocaleLowerCase().replace(/[^a-z0-9]+/g, "");
}

export class ComputerSensorMonitor {
  #child = null;
  #closed = false;
  #retryAfter = 0;
  #buffer = "";
  #inventory = [];
  #previous = new Map();
  #sessionEnergy = new Map();
  #lastHeartbeatUtc = null;
  #snapshot;

  constructor() {
    this.#snapshot = {
      status: process.platform === "win32" ? "starting" : "unsupported",
      message: process.platform === "win32"
        ? "Starting local hardware sensor discovery."
        : "Automatic hardware power sensors are currently supported on Windows.",
      sampledAtUtc: null,
      providers: [],
      readings: [],
      devices: [],
      totalPowerWatts: null
    };
    if (process.platform === "win32") this.#start();
  }

  getSnapshot() {
    if (process.platform === "win32" && !this.#closed && !this.#child && Date.now() >= this.#retryAfter) {
      this.#start();
    }
    return this.#snapshot;
  }

  close() {
    this.#closed = true;
    if (!this.#child) return;
    const child = this.#child;
    this.#child = null;
    child.kill();
  }

  #start() {
    this.#buffer = "";
    let child;
    try {
      child = spawn("powershell.exe", [
        "-NoLogo",
        "-NoProfile",
        "-NonInteractive",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        path.normalize(powershellScript),
        "-IncludeInventory"
      ], {
        windowsHide: true,
        shell: false,
        stdio: ["ignore", "pipe", "pipe"]
      });
    } catch {
      this.#handleUnavailable("Could not start the Windows hardware sensor helper.");
      return;
    }

    this.#child = child;
    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk) => this.#handleOutput(chunk));
    child.stdout.on("error", () => this.#handleUnavailable("The Windows hardware sensor helper stopped returning data."));
    child.stderr.on("data", () => {});
    child.stderr.on("error", () => {});
    child.on("error", () => this.#handleUnavailable("PowerShell is unavailable; automatic hardware readings could not start."));
    child.on("close", () => {
      if (this.#child === child) this.#child = null;
      if (!this.#closed) {
        this.#retryAfter = Date.now() + 5_000;
        this.#handleUnavailable("The Windows hardware sensor helper stopped. It will retry automatically.");
      }
    });
  }

  #handleOutput(chunk) {
    this.#buffer += chunk;
    if (Buffer.byteLength(this.#buffer, "utf8") > maximumLineBytes) {
      this.#buffer = "";
      this.#handleUnavailable("The Windows hardware sensor response was too large.");
      this.#child?.kill();
      return;
    }
    let end;
    while ((end = this.#buffer.indexOf("\n")) >= 0) {
      const line = this.#buffer.slice(0, end).trim();
      this.#buffer = this.#buffer.slice(end + 1);
      if (!line) continue;
      try {
        this.#accept(JSON.parse(line));
      } catch {
        this.#handleUnavailable("The Windows hardware sensor response could not be read.");
      }
    }
  }

  #accept(payload) {
    if (!payload || !Array.isArray(payload.readings) || !Array.isArray(payload.providers)) return;
    if (Array.isArray(payload.inventory)) this.#inventory = payload.inventory;
    this.#lastHeartbeatUtc = typeof payload.capturedAtUtc === "string" ? payload.capturedAtUtc : new Date().toISOString();
    const capturedAtMs = Date.parse(this.#lastHeartbeatUtc);
    const monotonicNow = process.hrtime.bigint();
    const readings = payload.readings.map((reading) => this.#enrichReading(reading, capturedAtMs, monotonicNow));
    const devices = this.#inventory.map((device) => this.#withCoverage(device, readings));
    const measuredCount = readings.filter((reading) => Number.isFinite(reading.watts)).length;
    const inventoryCount = devices.length;
    const status = measuredCount > 0 ? "available" : inventoryCount > 0 ? "partial" : "unavailable";
    const message = measuredCount > 0
      ? "Live readings are available for the hardware channels exposed by this PC."
      : inventoryCount > 0
        ? "Devices were detected, but Windows did not expose a live watt sensor for them."
        : "No supported live hardware power sensors were found on this PC.";
    this.#snapshot = {
      status,
      message,
      sampledAtUtc: this.#lastHeartbeatUtc,
      providers: payload.providers,
      readings,
      devices,
      totalPowerWatts: null,
      totalPowerNote: "Sensor channels overlap and do not cover the whole PC; a total would be misleading."
    };
  }

  #enrichReading(reading, capturedAtMs, monotonicNow) {
    const id = typeof reading.id === "string" ? reading.id : "unknown-sensor";
    const previous = this.#previous.get(id);
    let watts = Number.isFinite(reading.watts) ? reading.watts : null;
    let intervalEnergyWh = null;

    if (typeof reading.absoluteEnergyPwh === "string" && typeof reading.absoluteTime100ns === "string") {
      try {
        const currentEnergy = BigInt(reading.absoluteEnergyPwh);
        const currentTime = BigInt(reading.absoluteTime100ns);
        if (previous?.absoluteEnergy !== undefined && previous?.absoluteTime !== undefined &&
            currentEnergy >= previous.absoluteEnergy && currentTime > previous.absoluteTime) {
          const deltaEnergy = currentEnergy - previous.absoluteEnergy;
          const deltaTime = currentTime - previous.absoluteTime;
          intervalEnergyWh = Number(deltaEnergy) / 1_000_000_000_000;
          watts = Number(deltaEnergy) * 0.036 / Number(deltaTime);
        }
        this.#previous.set(id, { absoluteEnergy: currentEnergy, absoluteTime: currentTime, monotonicNow, capturedAtMs });
      } catch {
        watts = null;
      }
    } else if (Number.isFinite(watts)) {
      if (previous && monotonicNow > previous.monotonicNow) {
        const elapsedSeconds = Number(monotonicNow - previous.monotonicNow) / 1_000_000_000;
        if (elapsedSeconds <= 30) intervalEnergyWh = ((previous.watts + watts) / 2) * elapsedSeconds / 3600;
      }
      this.#previous.set(id, { watts, monotonicNow, capturedAtMs });
    }

    if (Number.isFinite(intervalEnergyWh) && intervalEnergyWh >= 0) {
      this.#sessionEnergy.set(id, (this.#sessionEnergy.get(id) ?? 0) + intervalEnergyWh);
    }

    return {
      ...reading,
      watts: Number.isFinite(watts) && watts >= 0 && watts <= 100_000 ? watts : null,
      intervalEnergyWh,
      energyWhSinceStart: this.#sessionEnergy.get(id) ?? 0
    };
  }

  #withCoverage(device, readings) {
    let matching = [];
    if (device.kind === "processor") {
      const processors = this.#inventory.filter((item) => item.kind === "processor");
      if (processors.length === 1) {
        matching = readings.filter((reading) =>
          reading.kind === "processor" && reading.source === "Windows Energy Metering Interface (EMI)"
        );
      }
    }
    if (device.kind === "graphics") {
      const sameNameDevices = this.#inventory.filter((item) =>
        item.kind === "graphics" && normalizeDeviceName(item.name) === normalizeDeviceName(device.name)
      );
      if (sameNameDevices.length === 1) {
        matching = readings.filter((reading) =>
          reading.kind === "graphics" && normalizeDeviceName(reading.device) === normalizeDeviceName(device.name)
        );
      }
    }
    // DRAM telemetry is a shared memory domain and cannot identify an individual DIMM.
    const hasWatts = matching.some((reading) => Number.isFinite(reading.watts));
    const sharedPowerPathWith = device.containerId && ["keyboard", "mouse", "usb"].includes(device.kind)
      ? [...new Set(this.#inventory
        .filter((item) => item.id !== device.id && item.containerId === device.containerId && ["keyboard", "mouse", "usb"].includes(item.kind))
        .map((item) => item.name))]
      : [];
    return {
      ...device,
      measurementStatus: hasWatts ? "measured" : "unavailable",
      coveredBy: hasWatts ? matching.filter((reading) => Number.isFinite(reading.watts)).map((reading) => reading.name) : [],
      sharedPowerPathWith
    };
  }

  #handleUnavailable(message) {
    this.#snapshot = {
      status: "unavailable",
      message,
      sampledAtUtc: this.#lastHeartbeatUtc,
      providers: [],
      readings: [],
      devices: this.#inventory.map((device) => this.#withCoverage(device, [])),
      totalPowerWatts: null,
      totalPowerNote: "A total PC watt reading is not available without an external wall power meter."
    };
  }
}
