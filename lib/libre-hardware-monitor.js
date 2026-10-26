const defaultPort = 8085;
const pollIntervalMs = 15_000;
const requestTimeoutMs = 1_000;
const maximumResponseBytes = 2 * 1024 * 1024;

export function configuredLibreHardwareMonitorPort() {
  const value = process.env.POWER_MONITOR_LHM_PORT;
  if (value === undefined || value.trim() === "") return defaultPort;
  if (!/^\d{1,5}$/.test(value)) return defaultPort;
  const port = Number(value);
  return port >= 1 && port <= 65_535 ? port : defaultPort;
}

export function parseLibreHardwareMonitorSnapshot(snapshot, sampledAtUtc = new Date().toISOString()) {
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) return [];
  const readings = [];
  const visit = (node, hardware = null) => {
    if (!node || typeof node !== "object" || Array.isArray(node)) return;

    const currentHardware = typeof node.HardwareId === "string"
      ? { id: node.HardwareId, name: typeof node.Text === "string" ? node.Text : "Hardware" }
      : hardware;

    if (node.Type === "Power" && typeof node.SensorId === "string" && currentHardware) {
      const watts = finiteNumber(node.RawValue);
      if (watts !== null && watts >= 0 && watts <= 100_000) {
        readings.push({
          id: `librehw:${node.SensorId}`,
          name: typeof node.Text === "string" ? node.Text : "Power sensor",
          kind: classifyHardware(currentHardware.id, currentHardware.name),
          device: currentHardware.name,
          watts,
          energyWhInterval: null,
          source: "LibreHardwareMonitor local sensor server",
          method: "Latest hardware power sensor value (watts)",
          sampledAtUtc
        });
      }
    }

    if (Array.isArray(node.Children)) {
      for (const child of node.Children) visit(child, currentHardware);
    }
  };

  visit(snapshot);
  return readings;
}

export class LibreHardwareMonitorSource {
  #port = configuredLibreHardwareMonitorPort();
  #onSnapshot;
  #timer = null;
  #closed = false;
  #polling = false;
  #controller = null;

  constructor(onSnapshot) {
    this.#onSnapshot = onSnapshot;
  }

  start() {
    if (this.#closed || this.#timer) return;
    void this.#poll();
    this.#timer = setInterval(() => void this.#poll(), pollIntervalMs);
    this.#timer.unref?.();
  }

  close() {
    this.#closed = true;
    if (this.#timer) clearInterval(this.#timer);
    this.#timer = null;
    this.#controller?.abort();
  }

  async #poll() {
    if (this.#closed || this.#polling) return;
    this.#polling = true;
    const controller = new AbortController();
    this.#controller = controller;
    const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);
    timeout.unref?.();

    try {
      const response = await fetch(`http://127.0.0.1:${this.#port}/data.json`, {
        method: "GET",
        headers: { accept: "application/json" },
        redirect: "error",
        signal: controller.signal
      });
      if (!response.ok || !response.headers.get("content-type")?.toLocaleLowerCase("en-US").includes("json")) {
        this.#publishUnavailable();
        return;
      }

      const contentLength = Number(response.headers.get("content-length"));
      if (Number.isFinite(contentLength) && contentLength > maximumResponseBytes) {
        await response.body?.cancel();
        this.#publishUnavailable();
        return;
      }

      const chunks = [];
      let byteLength = 0;
      if (!response.body) {
        this.#publishUnavailable();
        return;
      }
      for await (const chunk of response.body) {
        byteLength += chunk.byteLength;
        if (byteLength > maximumResponseBytes) {
          await response.body.cancel();
          this.#publishUnavailable();
          return;
        }
        chunks.push(Buffer.from(chunk));
      }

      const payload = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      const sampledAtUtc = new Date().toISOString();
      this.#onSnapshot({
        available: true,
        readings: parseLibreHardwareMonitorSnapshot(payload, sampledAtUtc),
        sampledAtUtc
      });
    } catch {
      this.#publishUnavailable();
    } finally {
      clearTimeout(timeout);
      if (this.#controller === controller) this.#controller = null;
      this.#polling = false;
    }
  }

  #publishUnavailable() {
    if (!this.#closed) this.#onSnapshot({ available: false, readings: [], sampledAtUtc: null });
  }
}

function finiteNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function classifyHardware(id, name) {
  const value = `${id} ${name}`.toLocaleLowerCase("en-US");
  if (/nvidia|radeon|geforce|graphics|gpu|displayadapter/.test(value)) return "graphics";
  if (/monitor|display/.test(value)) return "monitor";
  if (/keyboard|keypad/.test(value)) return "keyboard";
  if (/mouse|pointing/.test(value)) return "mouse";
  if (/network|ethernet|wireless|wi-?fi|\bnic\b/.test(value)) return "network";
  if (/audio|sound|codec/.test(value)) return "audio";
  if (/usb/.test(value)) return "usb";
  if (/intelcpu|amdcpu|processor|cpu/.test(value)) return "processor";
  if (/memory|dram|ram/.test(value)) return "memory";
  if (/ssd|hdd|nvme|storage|disk/.test(value)) return "storage";
  if (/motherboard|mainboard|superio/.test(value)) return "motherboard";
  if (/powersupply|\bpsu\b/.test(value)) return "power-supply";
  return "other";
}
