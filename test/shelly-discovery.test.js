import test from "node:test";
import assert from "node:assert/strict";
import {
  buildShellyMdnsQuery,
  parseShellyMdnsServices,
  passwordForShellyMeterSelection,
  selectShellyMeterForSweep
} from "../lib/shelly-discovery.js";

test("builds a scoped mDNS PTR query for Shelly devices", () => {
  const query = buildShellyMdnsQuery();
  assert.equal(query.readUInt16BE(4), 1);
  assert.equal(query.readUInt16BE(6), 0);

  const labels = [];
  let offset = 12;
  while (query[offset] !== 0) {
    const length = query[offset++];
    labels.push(query.toString("ascii", offset, offset + length));
    offset += length;
  }
  assert.equal(labels.join("."), "_shelly._tcp.local");
  assert.equal(query.readUInt16BE(offset + 1), 12);
  assert.equal(query.readUInt16BE(offset + 3), 0x8001);
});

test("finds private-network Shelly services from PTR, SRV, TXT, and A records", () => {
  const serviceName = "_shelly._tcp.local";
  const instanceName = "shellyplugpmg3-a1b2c3._shelly._tcp.local";
  const hostName = "shellyplugpmg3-a1b2c3.local";
  const response = makeResponse([
    makeRecord(serviceName, 12, encodeName(instanceName)),
    makeRecord(instanceName, 33, Buffer.concat([Buffer.alloc(4), uint16(80), encodeName(hostName)])),
    makeRecord(instanceName, 16, makeTxt("gen=3", "app=shellyplugpmg3")),
    makeRecord(hostName, 1, Buffer.from([192, 168, 1, 50]))
  ]);

  const [device] = parseShellyMdnsServices([response]);
  assert.ok(device);
  assert.deepEqual(device, {
    id: device.id,
    name: "shellyplugpmg3-a1b2c3",
    model: "shellyplugpmg3",
    generation: "3",
    host: "192.168.1.50",
    port: 80
  });
  assert.match(device.id, /^[a-f0-9]{16}$/);
});

test("ignores discovered service records outside private IPv4 ranges", () => {
  const serviceName = "_shelly._tcp.local";
  const instanceName = "shellyplugpmg3-a1b2c3._shelly._tcp.local";
  const hostName = "shellyplugpmg3-a1b2c3.local";
  const response = makeResponse([
    makeRecord(serviceName, 12, encodeName(instanceName)),
    makeRecord(instanceName, 33, Buffer.concat([Buffer.alloc(4), uint16(80), encodeName(hostName)])),
    makeRecord(hostName, 1, Buffer.from([203, 0, 113, 10]))
  ]);

  assert.deepEqual(parseShellyMdnsServices([response]), []);
});

test("ignores loopback hosts and accepts advertised HTTP ports", () => {
  const serviceName = "_shelly._tcp.local";
  const instanceName = "shellyplugpmg3-a1b2c3._shelly._tcp.local";
  const hostName = "shellyplugpmg3-a1b2c3.local";
  const loopbackResponse = makeResponse([
    makeRecord(serviceName, 12, encodeName(instanceName)),
    makeRecord(instanceName, 33, Buffer.concat([Buffer.alloc(4), uint16(80), encodeName(hostName)])),
    makeRecord(hostName, 1, Buffer.from([127, 0, 0, 1]))
  ]);
  const nonstandardPortResponse = makeResponse([
    makeRecord(serviceName, 12, encodeName(instanceName)),
    makeRecord(instanceName, 33, Buffer.concat([Buffer.alloc(4), uint16(8080), encodeName(hostName)])),
    makeRecord(hostName, 1, Buffer.from([192, 168, 1, 50]))
  ]);

  assert.deepEqual(parseShellyMdnsServices([loopbackResponse]), []);
  assert.equal(parseShellyMdnsServices([nonstandardPortResponse])[0].port, 8080);
});

test("keeps a selected meter across missed sweeps and never switches to its neighbor", () => {
  const first = { id: "pc-meter" };
  const second = { id: "neighbor-meter" };

  assert.deepEqual(selectShellyMeterForSweep([first]), { meter: first, discovered: true, newlySelected: true });
  assert.deepEqual(selectShellyMeterForSweep([first, second]), { meter: null, discovered: false, newlySelected: false });
  assert.deepEqual(selectShellyMeterForSweep([second], first), { meter: first, discovered: false, newlySelected: false });
  assert.deepEqual(selectShellyMeterForSweep([], first), { meter: first, discovered: false, newlySelected: false });
});

test("never reuses one meter password for a different discovered device", () => {
  assert.equal(passwordForShellyMeterSelection({
    deviceId: "pc-meter",
    selectedDeviceId: "pc-meter",
    currentPassword: "secret"
  }), "secret");
  assert.equal(passwordForShellyMeterSelection({
    deviceId: "neighbor-meter",
    selectedDeviceId: "pc-meter",
    currentPassword: "secret"
  }), "");
  assert.equal(passwordForShellyMeterSelection({
    deviceId: "neighbor-meter",
    selectedDeviceId: "pc-meter",
    currentPassword: "secret",
    providedPassword: "other-secret"
  }), "other-secret");
});

function makeResponse(records) {
  const header = Buffer.alloc(12);
  header.writeUInt16BE(0x8400, 2);
  header.writeUInt16BE(records.length, 6);
  return Buffer.concat([header, ...records]);
}

function makeRecord(name, type, data) {
  const header = Buffer.alloc(10);
  header.writeUInt16BE(type, 0);
  header.writeUInt16BE(1, 2);
  header.writeUInt32BE(120, 4);
  header.writeUInt16BE(data.length, 8);
  return Buffer.concat([encodeName(name), header, data]);
}

function encodeName(name) {
  const labels = name.split(".");
  const chunks = [];
  for (const label of labels) {
    const bytes = Buffer.from(label, "ascii");
    chunks.push(Buffer.from([bytes.length]), bytes);
  }
  chunks.push(Buffer.from([0]));
  return Buffer.concat(chunks);
}

function makeTxt(...entries) {
  const chunks = [];
  for (const entry of entries) {
    const bytes = Buffer.from(entry, "utf8");
    chunks.push(Buffer.from([bytes.length]), bytes);
  }
  return Buffer.concat(chunks);
}

function uint16(value) {
  const result = Buffer.alloc(2);
  result.writeUInt16BE(value);
  return result;
}
