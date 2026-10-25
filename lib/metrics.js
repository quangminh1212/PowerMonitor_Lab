const maximumGapMinutes = 30;
const maximumClockDifferenceMs = 5_000;
const nanosecondsPerMinute = 60_000_000_000;

export function rangeBounds(range, now = Date.now()) {
  const durationMs = range === "7d"
    ? 7 * 24 * 60 * 60 * 1_000
    : range === "30d"
      ? 30 * 24 * 60 * 60 * 1_000
      : 24 * 60 * 60 * 1_000;

  return { from: now - durationMs, to: now };
}

export function summarize(allReadings, meter, from, to) {
  const selected = filterByMeter(allReadings, meter);
  const inRange = selected.filter((reading) => {
    const recordedAt = Date.parse(reading.recordedAtUtc);
    return Number.isFinite(recordedAt) && recordedAt >= from && recordedAt <= to;
  });

  const energyCandidates = selected.filter((reading) => Date.parse(reading.recordedAtUtc) <= to);
  const groups = new Map();
  for (const reading of energyCandidates) {
    const key = `${reading.meterName.toLocaleLowerCase("en-US")}\u0000${reading.sessionId}`;
    const group = groups.get(key) ?? [];
    group.push(reading);
    groups.set(key, group);
  }

  const energy = [...groups.values()].reduce((total, readings) => {
    const ordered = readings
      .map((reading) => ({ reading, recordedAt: Date.parse(reading.recordedAtUtc) }))
      .filter(({ reading, recordedAt }) => Number.isFinite(recordedAt) && typeof reading.monotonicTimestampNanoseconds === "string")
      .sort((left, right) => compareMonotonic(left.reading.monotonicTimestampNanoseconds, right.reading.monotonicTimestampNanoseconds));

    const beforeRange = ordered.filter(({ recordedAt }) => recordedAt < from).slice(-1);
    const withinRange = ordered.filter(({ recordedAt }) => recordedAt >= from);
    const result = calculateEnergy([...beforeRange, ...withinRange], from, to);
    return {
      wattHours: total.wattHours + result.wattHours,
      coveredMinutes: total.coveredMinutes + result.coveredMinutes,
      intervalsUsed: total.intervalsUsed + result.intervalsUsed,
      gapsOmitted: total.gapsOmitted + result.gapsOmitted
    };
  }, { wattHours: 0, coveredMinutes: 0, intervalsUsed: 0, gapsOmitted: 0 });

  const latestReading = [...selected]
    .filter((reading) => Number.isFinite(Date.parse(reading.recordedAtUtc)))
    .sort((left, right) => Date.parse(right.recordedAtUtc) - Date.parse(left.recordedAtUtc))[0] ?? null;

  return {
    latestReading,
    ...energy,
    readingsInRange: inRange.length,
    meterCount: new Set(selected.map((reading) => reading.meterName.toLocaleLowerCase("en-US"))).size,
    fromUtc: new Date(from).toISOString(),
    toUtc: new Date(to).toISOString()
  };
}

function calculateEnergy(ordered, rangeFrom, rangeTo) {
  const result = { wattHours: 0, coveredMinutes: 0, intervalsUsed: 0, gapsOmitted: 0 };

  for (let index = 1; index < ordered.length; index += 1) {
    const previous = ordered[index - 1];
    const current = ordered[index];
    let elapsedNanoseconds;
    try {
      elapsedNanoseconds = BigInt(current.reading.monotonicTimestampNanoseconds) - BigInt(previous.reading.monotonicTimestampNanoseconds);
    } catch {
      continue;
    }

    const elapsedMinutes = Number(elapsedNanoseconds) / nanosecondsPerMinute;
    const wallElapsedMs = current.recordedAt - previous.recordedAt;
    const intervalStart = Math.max(previous.recordedAt, rangeFrom);
    const intervalEnd = Math.min(current.recordedAt, rangeTo);

    if (elapsedMinutes <= 0 || intervalEnd <= intervalStart) continue;
    if (wallElapsedMs <= 0 || Math.abs(wallElapsedMs - elapsedMinutes * 60_000) > maximumClockDifferenceMs) {
      result.gapsOmitted += 1;
      continue;
    }
    if (elapsedMinutes > maximumGapMinutes) {
      result.gapsOmitted += 1;
      continue;
    }

    const startFraction = (intervalStart - previous.recordedAt) / wallElapsedMs;
    const endFraction = (intervalEnd - previous.recordedAt) / wallElapsedMs;
    const powerAtStart = previous.reading.watts + (current.reading.watts - previous.reading.watts) * startFraction;
    const powerAtEnd = previous.reading.watts + (current.reading.watts - previous.reading.watts) * endFraction;
    const coveredMinutes = elapsedMinutes * (endFraction - startFraction);

    result.wattHours += ((powerAtStart + powerAtEnd) / 2) * (coveredMinutes / 60);
    result.coveredMinutes += coveredMinutes;
    result.intervalsUsed += 1;
  }

  return result;
}

function filterByMeter(readings, meter) {
  if (!meter?.trim()) return readings;
  const wanted = meter.trim().toLocaleLowerCase("en-US");
  return readings.filter((reading) => reading.meterName.toLocaleLowerCase("en-US") === wanted);
}

function compareMonotonic(left, right) {
  const a = BigInt(left);
  const b = BigInt(right);
  return a < b ? -1 : a > b ? 1 : 0;
}
