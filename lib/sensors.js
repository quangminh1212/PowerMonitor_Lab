import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  configuredLibreHardwareMonitorPort,
  LibreHardwareMonitorSource
} from "./libre-hardware-monitor.js";
import { ShellyLocalMeterSource } from "./shelly-local-meter.js";
import { attachDevicePowerEstimates } from "./device-estimates.js";

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
  #lastSensorError = null;
  #nativeReadings = [];
  #nativeProviders = [];
  #externalSnapshot = { available: false, readings: [], sampledAtUtc: null };
  #externalSource = null;
  #pcMeterSnapshot = { available: false, configured: false, readings: [], sampledAtUtc: null };
  #pcMeterSource = null;
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
    if (process.platform === "win32") {
      this.#externalSource = new LibreHardwareMonitorSource((snapshot) => {
        const sampledAtUtc = snapshot.sampledAtUtc ?? new Date().toISOString();
        this.#externalSnapshot = {
          ...snapshot,
          readings: snapshot.readings.map((reading) => this.#enrichReading(
            reading,
            Date.parse(sampledAtUtc),
            process.hrtime.bigint(),
            sampledAtUtc
          ))
        };
        this.#publish();
      });
      this.#externalSource.start();
      this.#pcMeterSource = new ShellyLocalMeterSource({
        address: process.env.POWER_MONITOR_PC_METER_HOST,
        password: process.env.POWER_MONITOR_PC_METER_PASSWORD,
        componentId: process.env.POWER_MONITOR_PC_METER_COMPONENT,
        onSnapshot: (snapshot) => {
          const sampledAtUtc = snapshot.sampledAtUtc ?? new Date().toISOString();
          this.#pcMeterSnapshot = {
            ...snapshot,
            readings: snapshot.readings.map((reading) => this.#enrichReading(
              reading,
              Date.parse(sampledAtUtc),
              process.hrtime.bigint(),
              sampledAtUtc
            ))
          };
          this.#publish();
        }
      });
      this.#pcMeterSource.start();
      this.#start();
    }
  }

  getSnapshot() {
    if (process.platform === "win32" && !this.#closed && !this.#child && Date.now() >= this.#retryAfter) {
      this.#start();
    }
    return this.#snapshot;
  }

  close() {
    this.#closed = true;
    this.#externalSource?.close();
    this.#pcMeterSource?.close();
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
    this.#lastSensorError = null;
    this.#lastHeartbeatUtc = typeof payload.capturedAtUtc === "string" ? payload.capturedAtUtc : new Date().toISOString();
    const capturedAtMs = Date.parse(this.#lastHeartbeatUtc);
    const monotonicNow = process.hrtime.bigint();
    this.#nativeReadings = payload.readings.map((reading) => this.#enrichReading(
      reading,
      capturedAtMs,
      monotonicNow,
      this.#lastHeartbeatUtc
    ));
    this.#nativeProviders = payload.providers;
    this.#publish();
  }

  #enrichReading(reading, capturedAtMs, monotonicNow, sampledAtUtc = new Date(capturedAtMs).toISOString()) {
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
    } else if (Number.isFinite(reading.absoluteEnergyWh) && reading.absoluteEnergyWh >= 0) {
      const currentEnergyWh = reading.absoluteEnergyWh;
      if (previous?.absoluteEnergyWh !== undefined && currentEnergyWh >= previous.absoluteEnergyWh) {
        intervalEnergyWh = currentEnergyWh - previous.absoluteEnergyWh;
      }
      this.#previous.set(id, { absoluteEnergyWh: currentEnergyWh, watts, monotonicNow, capturedAtMs });
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
      sampledAtUtc,
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
          reading.kind === "processor" && [
            "Windows Energy Metering Interface (EMI)",
            "LibreHardwareMonitor local sensor server"
          ].includes(reading.source)
        );
      }
    }
    if (device.kind === "graphics") {
      const sameNameDevices = this.#inventory.filter((item) =>
        item.kind === "graphics" && normalizeDeviceName(item.name) === normalizeDeviceName(device.name)
      );
      if (sameNameDevices.length === 1) {
        matching = readings.filter((reading) =>
          reading.kind === "graphics" && reading.source === "NVIDIA nvidia-smi" &&
          normalizeDeviceName(reading.device) === normalizeDeviceName(device.name)
        );
        if (!matching.some((reading) => Number.isFinite(reading.watts))) {
          matching = readings.filter((reading) =>
            reading.kind === "graphics" &&
            reading.source === "LibreHardwareMonitor local sensor server" &&
            normalizeDeviceName(reading.device) === normalizeDeviceName(device.name)
          );
        }
      }
    }
    if (["storage", "motherboard", "power-supply"].includes(device.kind)) {
      const sameNameDevices = this.#inventory.filter((item) =>
        item.kind === device.kind && normalizeDeviceName(item.name) === normalizeDeviceName(device.name)
      );
      if (sameNameDevices.length === 1) {
        matching = readings.filter((reading) =>
          reading.source === "LibreHardwareMonitor local sensor server" &&
          normalizeDeviceName(reading.device) === normalizeDeviceName(device.name)
        );
      }
    }
    if (!matching.some((reading) => Number.isFinite(reading.watts))) {
      const normalizedName = normalizeDeviceName(device.name);
      const sameNameDevices = this.#inventory.filter((item) =>
        normalizeDeviceName(item.name) === normalizedName
      );
      if (normalizedName && sameNameDevices.length === 1) {
        matching = readings.filter((reading) =>
          reading.source === "LibreHardwareMonitor local sensor server" &&
          normalizeDeviceName(reading.device) === normalizedName &&
          (reading.kind === device.kind || reading.kind === "other")
        );
      }
    }
    // A Windows EMI DRAM channel is useful for the memory subsystem, but it
    // cannot identify an individual DIMM. Keep that coverage explicitly shared.
    const sharedMemoryReadings = device.kind === "memory"
      ? readings.filter((reading) =>
        reading.source === "Windows Energy Metering Interface (EMI)" &&
        reading.kind === "memory" &&
        /dram/i.test(reading.name ?? "") &&
        Number.isFinite(reading.watts)
      )
      : [];
    const hasWatts = matching.some((reading) => Number.isFinite(reading.watts));
    const hasSharedMemoryWatts = !hasWatts && sharedMemoryReadings.length > 0;
    const sharedPowerPathWith = device.containerId && ["keyboard", "mouse", "usb"].includes(device.kind)
      ? [...new Set(this.#inventory
        .filter((item) => item.id !== device.id && item.containerId === device.containerId && ["keyboard", "mouse", "usb"].includes(item.kind))
        .map((item) => item.name))]
      : [];
    return {
      ...device,
      measurementStatus: hasWatts ? "measured" : hasSharedMemoryWatts ? "shared" : "unavailable",
      coveredBy: hasWatts
        ? matching.filter((reading) => Number.isFinite(reading.watts)).map((reading) => reading.name)
        : hasSharedMemoryWatts ? sharedMemoryReadings.map((reading) => reading.name) : [],
      sharedPowerPathWith
    };
  }

  #handleUnavailable(message) {
    this.#nativeReadings = [];
    this.#nativeProviders = [];
    this.#lastSensorError = message;
    this.#publish();
  }

  #publish() {
    const intelFSeriesCpu = this.#inventory.some((device) =>
      device.kind === "processor" &&
      /intel/i.test(device.name ?? "") &&
      /\b\d{4,5}(?:KF|F)\b/i.test(device.name ?? "")
    );
    const readings = [...this.#nativeReadings, ...this.#externalSnapshot.readings, ...this.#pcMeterSnapshot.readings]
      .filter((reading) => !(reading.name === "RAPL_Package0_PP1" && intelFSeriesCpu));
    const coveredDevices = this.#inventory.map((device) => this.#withCoverage(device, readings));
    const devices = attachDevicePowerEstimates(coveredDevices, readings);
    const measuredCount = readings.filter((reading) => Number.isFinite(reading.watts)).length;
    const inventoryCount = devices.length;
    const status = measuredCount > 0 ? "available" : inventoryCount > 0 ? "partial" : "unavailable";
    const message = measuredCount > 0
      ? "Live readings are available for the hardware channels exposed by this PC."
      : this.#lastSensorError ?? (inventoryCount > 0
        ? "Devices were detected, but no live watt sensors were exposed."
        : "No supported live hardware power sensors were found on this PC.");
    const providers = [
      ...this.#nativeProviders,
      ...(process.platform === "win32" ? [{
        id: "libre-hardware-monitor",
        name: `LibreHardwareMonitor local sensor server (127.0.0.1:${configuredLibreHardwareMonitorPort()})`,
        available: this.#externalSnapshot.available
      }, {
        id: "shelly-local-meter",
        name: "Shelly PC outlet meter (local RPC, Digest authentication)",
        available: this.#pcMeterSnapshot.available,
        configured: this.#pcMeterSnapshot.configured,
        reason: this.#pcMeterSnapshot.reason ?? "not-configured"
      }] : [])
    ];
    const sampledAtUtc = [this.#lastHeartbeatUtc, this.#externalSnapshot.sampledAtUtc]
      .concat(this.#pcMeterSnapshot.sampledAtUtc ?? [])
      .filter((value) => typeof value === "string")
      .sort((left, right) => Date.parse(right) - Date.parse(left))[0] ?? null;
    const pcInputReading = readings.find((reading) =>
      reading.id === "shelly-pc-input" && Number.isFinite(reading.watts)
    );
    this.#snapshot = {
      status,
      message,
      sampledAtUtc,
      providers,
      readings,
      devices,
      totalPowerWatts: pcInputReading?.watts ?? null
    };
  }
}
