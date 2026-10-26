import {
  automaticHistoryMaximumGapMs,
  automaticHistorySampleIntervalMs
} from "./sensor-history.js";

const millisecondsPerHour = 60 * 60 * 1_000;
const millisecondsPerDay = 24 * millisecondsPerHour;
const rangeDurations = {
  "1h": millisecondsPerHour,
  "24h": millisecondsPerDay,
  "7d": 7 * millisecondsPerDay,
  "30d": 30 * millisecondsPerDay
};
const bucketDurations = {
  "1h": 5 * 60 * 1_000,
  "24h": millisecondsPerHour,
  "7d": millisecondsPerDay,
  "30d": millisecondsPerDay
};
const maximumPowerWatts = 100_000;

export function energyHistoryRangeBounds(range, now = Date.now()) {
  const duration = rangeDurations[range] ?? rangeDurations["24h"];
  return { from: now - duration, to: now };
}

export function aggregateEnergyHistory(samples, {
  range,
  from,
  to,
  sampleIntervalMs = automaticHistorySampleIntervalMs,
  maximumGapMs = automaticHistoryMaximumGapMs
} = {}) {
  if (!Number.isFinite(from) || !Number.isFinite(to) || to <= from) {
    throw new TypeError("A valid energy history time range is required.");
  }
  const selectedRange = Object.hasOwn(rangeDurations, range) ? range : "24h";
  const bucketDurationMs = bucketDurations[selectedRange];
  const rangeDurationMs = to - from;
  const bucketCount = Math.ceil(rangeDurationMs / bucketDurationMs);
  const channels = new Map();

  for (const sample of samples) {
    const timestamp = Date.parse(sample?.sampledAtUtc);
    if (!isHistorySample(sample) ||
        !Number.isFinite(timestamp) ||
        timestamp < from - maximumGapMs ||
        timestamp > to) {
      continue;
    }
    const key = sample.source + "\u0000" + sample.sensorId;
    let channel = channels.get(key);
    if (!channel) {
      channel = {
        sensorId: sample.sensorId,
        name: sample.name,
        kind: sample.kind,
        device: sample.device,
        source: sample.source,
        samples: [],
        methods: new Set()
      };
      channels.set(key, channel);
    }
    channel.samples.push({ ...sample, timestamp });
  }

  const resultChannels = [];
  for (const channel of channels.values()) {
    channel.samples.sort((left, right) => left.timestamp - right.timestamp);
    const inRangeSampleCount = channel.samples.filter((sample) =>
      sample.timestamp >= from && sample.timestamp <= to
    ).length;
    if (inRangeSampleCount === 0) continue;

    const buckets = Array.from({ length: bucketCount }, (_, index) => ({
      from: from + index * bucketDurationMs,
      to: Math.min(to, from + (index + 1) * bucketDurationMs),
      energyWh: 0,
      coveredSeconds: 0
    }));

    for (let index = 1; index < channel.samples.length; index += 1) {
      const previous = channel.samples[index - 1];
      const current = channel.samples[index];
      const elapsedMs = current.timestamp - previous.timestamp;
      if (elapsedMs <= 0 || elapsedMs > maximumGapMs) continue;

      const intervalFrom = Math.max(from, previous.timestamp);
      const intervalTo = Math.min(to, current.timestamp);
      if (intervalTo <= intervalFrom) continue;

      const counter = getCounterDelta(previous, current, elapsedMs);
      const method = counter?.method ?? "measured-power-integration";
      channel.methods.add(method);

      let bucketIndex = Math.max(0, Math.floor((intervalFrom - from) / bucketDurationMs));
      while (bucketIndex < buckets.length && buckets[bucketIndex].from < intervalTo) {
        const bucket = buckets[bucketIndex];
        const segmentFrom = Math.max(intervalFrom, bucket.from);
        const segmentTo = Math.min(intervalTo, bucket.to);
        if (segmentTo > segmentFrom) {
          const energyWh = counter
            ? counter.energyWh * ((segmentTo - segmentFrom) / elapsedMs)
            : integratePowerSegment(previous, current, segmentFrom, segmentTo, elapsedMs);
          bucket.energyWh += energyWh;
          bucket.coveredSeconds += (segmentTo - segmentFrom) / 1_000;
        }
        bucketIndex += 1;
      }
    }

    const coveredSeconds = buckets.reduce((total, bucket) => total + bucket.coveredSeconds, 0);
    const energyWh = coveredSeconds > 0
      ? buckets.reduce((total, bucket) => total + bucket.energyWh, 0)
      : null;
    resultChannels.push({
      sensorId: channel.sensorId,
      name: channel.name,
      kind: channel.kind,
      device: channel.device,
      source: channel.source,
      energyWh,
      coveredSeconds,
      coveragePercent: Math.min(100, coveredSeconds / (rangeDurationMs / 1_000) * 100),
      method: summarizeMethods(channel.methods),
      buckets: buckets.map((bucket) => ({
        fromUtc: new Date(bucket.from).toISOString(),
        toUtc: new Date(bucket.to).toISOString(),
        energyWh: bucket.coveredSeconds > 0 ? bucket.energyWh : null,
        coveredSeconds: bucket.coveredSeconds,
        coveragePercent: Math.min(100, bucket.coveredSeconds / ((bucket.to - bucket.from) / 1_000) * 100)
      }))
    });
  }

  resultChannels.sort((left, right) =>
    Number(right.sensorId === "shelly-pc-input") - Number(left.sensorId === "shelly-pc-input") ||
    left.name.localeCompare(right.name)
  );
  return {
    range: selectedRange,
    fromUtc: new Date(from).toISOString(),
    toUtc: new Date(to).toISOString(),
    bucketIntervalSeconds: bucketDurationMs / 1_000,
    sampleIntervalSeconds: sampleIntervalMs / 1_000,
    maximumGapSeconds: maximumGapMs / 1_000,
    channels: resultChannels
  };
}

function getCounterDelta(previous, current, elapsedMs) {
  if (Number.isFinite(previous.absoluteEnergyWh) &&
      Number.isFinite(current.absoluteEnergyWh) &&
      current.absoluteEnergyWh >= previous.absoluteEnergyWh) {
    const energyWh = current.absoluteEnergyWh - previous.absoluteEnergyWh;
    if (isPlausibleCounterDelta(energyWh, elapsedMs)) {
      return { energyWh, method: "meter-counter" };
    }
  }
  if (typeof previous.energySessionId === "string" &&
      previous.energySessionId.length > 0 &&
      previous.energySessionId === current.energySessionId &&
      Number.isFinite(previous.energyWhSinceStart) &&
      Number.isFinite(current.energyWhSinceStart) &&
      current.energyWhSinceStart >= previous.energyWhSinceStart) {
    const energyWh = current.energyWhSinceStart - previous.energyWhSinceStart;
    if (isPlausibleCounterDelta(energyWh, elapsedMs)) {
      return { energyWh, method: "session-counter" };
    }
  }
  return null;
}

function isPlausibleCounterDelta(energyWh, elapsedMs) {
  const maximumPlausibleWh = maximumPowerWatts * elapsedMs / millisecondsPerHour;
  return Number.isFinite(energyWh) && energyWh >= 0 && energyWh <= maximumPlausibleWh;
}

function integratePowerSegment(previous, current, segmentFrom, segmentTo, elapsedMs) {
  const fractionFrom = (segmentFrom - previous.timestamp) / elapsedMs;
  const fractionTo = (segmentTo - previous.timestamp) / elapsedMs;
  const powerAtFrom = previous.watts + (current.watts - previous.watts) * fractionFrom;
  const powerAtTo = previous.watts + (current.watts - previous.watts) * fractionTo;
  return ((powerAtFrom + powerAtTo) / 2) * (segmentTo - segmentFrom) / millisecondsPerHour;
}

function summarizeMethods(methods) {
  if (methods.size === 0) return "none";
  if (methods.size === 1) return [...methods][0];
  return "mixed";
}

function isHistorySample(sample) {
  return sample !== null &&
    typeof sample === "object" &&
    typeof sample.sensorId === "string" &&
    typeof sample.source === "string" &&
    Number.isFinite(sample.watts) &&
    sample.watts >= 0 &&
    sample.watts <= maximumPowerWatts;
}
