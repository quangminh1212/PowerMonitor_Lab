using System.Diagnostics;

namespace PowerMonitorLab;

public sealed record EnergySummary(double WattHours, double CoveredMinutes, int IntervalsUsed, int GapsOmitted);

public sealed record PowerSummary(
    PowerReading? LatestReading,
    double WattHours,
    double CoveredMinutes,
    int IntervalsUsed,
    int GapsOmitted,
    int ReadingsInRange,
    int MeterCount,
    DateTimeOffset FromUtc,
    DateTimeOffset ToUtc);

public static class PowerMetrics
{
    public static EnergySummary CalculateEnergy(
        IEnumerable<PowerReading> source,
        DateTimeOffset? rangeFromUtc = null,
        DateTimeOffset? rangeToUtc = null)
    {
        var ordered = source.OrderBy(reading => reading.MonotonicTimestampTicks).ToArray();
        var rangeFrom = rangeFromUtc ?? DateTimeOffset.MinValue;
        var rangeTo = rangeToUtc ?? DateTimeOffset.MaxValue;
        double wattHours = 0;
        double coveredMinutes = 0;
        var intervalsUsed = 0;
        var gapsOmitted = 0;

        for (var index = 1; index < ordered.Length; index++)
        {
            var previous = ordered[index - 1];
            var current = ordered[index];
            var elapsed = Stopwatch.GetElapsedTime(previous.MonotonicTimestampTicks, current.MonotonicTimestampTicks);
            var minutes = elapsed.TotalMinutes;
            var wallElapsed = current.RecordedAtUtc - previous.RecordedAtUtc;
            var intervalStart = previous.RecordedAtUtc > rangeFrom ? previous.RecordedAtUtc : rangeFrom;
            var intervalEnd = current.RecordedAtUtc < rangeTo ? current.RecordedAtUtc : rangeTo;
            if (minutes <= 0)
            {
                continue;
            }

            if (wallElapsed <= TimeSpan.Zero || Math.Abs((wallElapsed - elapsed).TotalSeconds) > 5)
            {
                gapsOmitted++;
                continue;
            }

            if (intervalEnd <= intervalStart)
            {
                continue;
            }

            if (minutes > 30)
            {
                gapsOmitted++;
                continue;
            }

            var wallMinutes = wallElapsed.TotalMinutes;
            var startFraction = (intervalStart - previous.RecordedAtUtc).TotalMinutes / wallMinutes;
            var endFraction = (intervalEnd - previous.RecordedAtUtc).TotalMinutes / wallMinutes;
            var powerAtStart = previous.Watts + (current.Watts - previous.Watts) * startFraction;
            var powerAtEnd = previous.Watts + (current.Watts - previous.Watts) * endFraction;
            var coveredIntervalMinutes = minutes * (endFraction - startFraction);
            wattHours += ((powerAtStart + powerAtEnd) / 2) * (coveredIntervalMinutes / 60);
            coveredMinutes += coveredIntervalMinutes;
            intervalsUsed++;
        }

        return new EnergySummary(wattHours, coveredMinutes, intervalsUsed, gapsOmitted);
    }

    public static PowerSummary Summarize(
        IReadOnlyCollection<PowerReading> allReadings,
        string? meter,
        DateTimeOffset fromUtc,
        DateTimeOffset toUtc)
    {
        var selectedReadings = string.IsNullOrWhiteSpace(meter)
            ? allReadings
            : allReadings.Where(reading => string.Equals(reading.MeterName, meter.Trim(), StringComparison.OrdinalIgnoreCase)).ToArray();
        var inRange = selectedReadings
            .Where(reading => reading.RecordedAtUtc >= fromUtc && reading.RecordedAtUtc <= toUtc)
            .ToArray();

        var energyReadings = selectedReadings.Where(reading => reading.RecordedAtUtc <= toUtc)
            .GroupBy(reading => reading.MeterName, StringComparer.OrdinalIgnoreCase)
            .SelectMany(meterReadings => meterReadings
                .GroupBy(reading => reading.SessionId)
                .SelectMany(sessionReadings => sessionReadings.Where(reading => reading.RecordedAtUtc < fromUtc).TakeLast(1)
                    .Concat(sessionReadings.Where(reading => reading.RecordedAtUtc >= fromUtc))));
        var energy = energyReadings
            .GroupBy(reading => (Meter: reading.MeterName.ToUpperInvariant(), reading.SessionId))
            .Select(group => CalculateEnergy(group, fromUtc, toUtc))
            .Aggregate(new EnergySummary(0, 0, 0, 0), (total, part) => new EnergySummary(
                total.WattHours + part.WattHours,
                total.CoveredMinutes + part.CoveredMinutes,
                total.IntervalsUsed + part.IntervalsUsed,
                total.GapsOmitted + part.GapsOmitted));

        return new PowerSummary(
            selectedReadings.OrderByDescending(reading => reading.RecordedAtUtc).FirstOrDefault(),
            energy.WattHours,
            energy.CoveredMinutes,
            energy.IntervalsUsed,
            energy.GapsOmitted,
            inRange.Length,
            selectedReadings.Select(reading => reading.MeterName).Distinct(StringComparer.OrdinalIgnoreCase).Count(),
            fromUtc,
            toUtc);
    }
}
