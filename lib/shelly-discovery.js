import { createHash } from "node:crypto";
import { createSocket } from "node:dgram";
import { isIPv4 } from "node:net";

const serviceType = "_shelly._tcp.local";
const multicastAddress = "224.0.0.251";
const multicastPort = 5353;
const maximumRecords = 256;
const maximumPacketBytes = 16 * 1024;

export function buildShellyMdnsQuery() {
  const labels = serviceType.split(".");
  const nameLength = labels.reduce((length, label) => length + 1 + Buffer.byteLength(label), 1);
  const query = Buffer.alloc(12 + nameLength + 4);
  query.writeUInt16BE(0, 0);
  query.writeUInt16BE(0, 2);
  query.writeUInt16BE(1, 4);
  let offset = 12;
  for (const label of labels) {
    const bytes = Buffer.from(label, "ascii");
    query[offset++] = bytes.length;
    bytes.copy(query, offset);
    offset += bytes.length;
  }
  query[offset++] = 0;
  query.writeUInt16BE(12, offset);
  query.writeUInt16BE(0x8001, offset + 2);
  return query;
}

export function parseShellyMdnsServices(packets) {
  const records = [];
  for (const packet of packets) records.push(...parseRecords(packet));

  const instances = new Set(records
    .filter((record) => record.type === 12 && record.name === serviceType)
    .map((record) => record.value)
    .filter((name) => typeof name === "string" && name.toLocaleLowerCase("en-US").endsWith(`.${serviceType}`)));
  const srvByName = new Map(records.filter((record) => record.type === 33).map((record) => [record.name, record.value]));
  const txtByName = new Map(records.filter((record) => record.type === 16).map((record) => [record.name, record.value]));
  const addressesByName = new Map();
  for (const record of records.filter((item) => item.type === 1)) {
    const addresses = addressesByName.get(record.name) ?? [];
    addresses.push(record.value);
    addressesByName.set(record.name, addresses);
  }

  const devices = [];
  const seen = new Set();
  for (const instance of instances) {
    const srv = srvByName.get(instance);
    if (!srv || !Number.isInteger(srv.port) || srv.port < 1 || !srv.target.endsWith(".local")) continue;
    for (const address of addressesByName.get(srv.target) ?? []) {
      if (!isPrivateAddress(address)) continue;
      const key = `${address}:${srv.port}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const label = instance.slice(0, -(`.${serviceType}`).length);
      const txt = txtByName.get(instance) ?? {};
      devices.push({
        id: createHash("sha256").update(`${label.toLowerCase()}|${key}`).digest("hex").slice(0, 16),
        name: label,
        model: cleanText(txt.model ?? txt.app ?? ""),
        generation: cleanText(txt.gen ?? ""),
        host: address,
        port: srv.port
      });
    }
  }
  return devices.sort((left, right) => left.name.localeCompare(right.name, "en", { sensitivity: "base" }));
}

export function selectShellyMeterForSweep(devices, selectedMeter = null) {
  if (!Array.isArray(devices)) return { meter: selectedMeter, discovered: false, newlySelected: false };
  if (selectedMeter) {
    const current = devices.find((device) => device.id === selectedMeter.id);
    return { meter: current ?? selectedMeter, discovered: Boolean(current), newlySelected: false };
  }
  if (devices.length === 1) return { meter: devices[0], discovered: true, newlySelected: true };
  return { meter: null, discovered: false, newlySelected: false };
}

export function passwordForShellyMeterSelection({ deviceId, selectedDeviceId, currentPassword, providedPassword = "" } = {}) {
  return deviceId === selectedDeviceId && !providedPassword ? currentPassword : providedPassword;
}

export async function discoverShellyDevices({ timeoutMs = 1_800, socketFactory = createSocket } = {}) {
  const boundedTimeout = Number.isSafeInteger(timeoutMs) && timeoutMs >= 250 && timeoutMs <= 5_000
    ? timeoutMs
    : 1_800;
  let socket;
  try {
    socket = socketFactory("udp4");
  } catch {
    return [];
  }

  const packets = [];
  return await new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { socket.close(); } catch {}
      resolve(parseShellyMdnsServices(packets));
    };
    const timer = setTimeout(finish, boundedTimeout);
    timer.unref?.();
    socket.on("message", (packet) => {
      if (packet.byteLength <= maximumPacketBytes && packets.length < 64) packets.push(packet);
    });
    socket.on("error", finish);
    try {
      socket.bind(0, "0.0.0.0", () => {
        try {
          socket.setMulticastTTL(1);
          const query = buildShellyMdnsQuery();
          socket.send(query, multicastPort, multicastAddress, (error) => {
            if (error) finish();
          });
        } catch {
          finish();
        }
      });
    } catch {
      finish();
    }
  });
}

function parseRecords(packet) {
  if (!Buffer.isBuffer(packet) || packet.byteLength < 12 || packet.byteLength > maximumPacketBytes) return [];
  const counts = [
    packet.readUInt16BE(4),
    packet.readUInt16BE(6),
    packet.readUInt16BE(8),
    packet.readUInt16BE(10)
  ];
  if (counts.reduce((sum, value) => sum + value, 0) > maximumRecords) return [];

  let offset = 12;
  for (let index = 0; index < counts[0]; index += 1) {
    const name = readDnsName(packet, offset);
    if (!name || name.offset + 4 > packet.byteLength) return [];
    offset = name.offset + 4;
  }

  const result = [];
  const resourceRecordCount = counts.slice(1).reduce((sum, value) => sum + value, 0);
  for (let index = 0; index < resourceRecordCount; index += 1) {
    const name = readDnsName(packet, offset);
    if (!name || name.offset + 10 > packet.byteLength) return result;
    const type = packet.readUInt16BE(name.offset);
    const dataLength = packet.readUInt16BE(name.offset + 8);
    const dataStart = name.offset + 10;
    const dataEnd = dataStart + dataLength;
    if (dataEnd > packet.byteLength) return result;
    const recordName = name.value.toLocaleLowerCase("en-US");

    if (type === 12) {
      const value = readDnsName(packet, dataStart);
      if (value) result.push({ name: recordName, type, value: value.value.toLocaleLowerCase("en-US") });
    } else if (type === 33 && dataLength >= 7) {
      const value = readDnsName(packet, dataStart + 6);
      if (value) {
        result.push({
          name: recordName,
          type,
          value: { port: packet.readUInt16BE(dataStart + 4), target: value.value.toLocaleLowerCase("en-US") }
        });
      }
    } else if (type === 16) {
      result.push({ name: recordName, type, value: parseTxt(packet.subarray(dataStart, dataEnd)) });
    } else if (type === 1 && dataLength === 4) {
      result.push({ name: recordName, type, value: [...packet.subarray(dataStart, dataEnd)].join(".") });
    }
    offset = dataEnd;
  }
  return result;
}

function readDnsName(packet, startOffset) {
  const labels = [];
  let offset = startOffset;
  let resumeOffset = null;
  let steps = 0;
  let totalLength = 0;
  while (offset < packet.byteLength && steps < 128) {
    steps += 1;
    const length = packet[offset];
    if ((length & 0xc0) === 0xc0) {
      if (offset + 1 >= packet.byteLength) return null;
      const pointer = ((length & 0x3f) << 8) | packet[offset + 1];
      if (pointer >= packet.byteLength) return null;
      if (resumeOffset === null) resumeOffset = offset + 2;
      offset = pointer;
      continue;
    }
    if (length & 0xc0) return null;
    offset += 1;
    if (length === 0) {
      return { value: labels.join("."), offset: resumeOffset ?? offset };
    }
    if (length > 63 || offset + length > packet.byteLength) return null;
    totalLength += length + 1;
    if (totalLength > 255) return null;
    labels.push(packet.toString("utf8", offset, offset + length));
    offset += length;
  }
  return null;
}

function parseTxt(data) {
  const result = {};
  let offset = 0;
  while (offset < data.byteLength) {
    const length = data[offset++];
    if (offset + length > data.byteLength) return {};
    const entry = data.toString("utf8", offset, offset + length);
    offset += length;
    const separator = entry.indexOf("=");
    if (separator > 0) result[entry.slice(0, separator).toLocaleLowerCase("en-US")] = entry.slice(separator + 1);
  }
  return result;
}

function isPrivateAddress(value) {
  if (!isIPv4(value)) return false;
  const [first, second] = value.split(".").map(Number);
  return first === 10 ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168) ||
    (first === 169 && second === 254);
}

function cleanText(value) {
  return typeof value === "string" && value.length <= 96 ? value.replace(/[\u0000-\u001f\u007f]/g, "").trim() : "";
}
