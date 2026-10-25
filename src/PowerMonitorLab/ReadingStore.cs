using System.IO;
using System.Text.Json;

namespace PowerMonitorLab;

public sealed record PowerReading(
    Guid Id,
    int SchemaVersion,
    string MeterName,
    double Watts,
    DateTimeOffset RecordedAtUtc,
    Guid SessionId,
    long MonotonicTimestampTicks,
    string Source,
    string? Note);

public sealed record ReadingInput(string? MeterName, double Watts, string? Note);

public sealed class ReadingStore
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        WriteIndented = true
    };

    private readonly string _filePath = Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
        "PowerMonitorLab",
        "readings.json");
    private readonly SemaphoreSlim _gate = new(1, 1);

    public async Task<IReadOnlyList<PowerReading>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        await _gate.WaitAsync(cancellationToken);
        try
        {
            return await ReadUnlockedAsync(cancellationToken);
        }
        finally
        {
            _gate.Release();
        }
    }

    public async Task AddAsync(PowerReading reading, CancellationToken cancellationToken = default)
    {
        await _gate.WaitAsync(cancellationToken);
        try
        {
            var readings = (await ReadUnlockedAsync(cancellationToken)).ToList();
            readings.Add(reading);
            await WriteUnlockedAsync(readings, cancellationToken);
        }
        finally
        {
            _gate.Release();
        }
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        await _gate.WaitAsync(cancellationToken);
        try
        {
            var readings = (await ReadUnlockedAsync(cancellationToken)).ToList();
            var removed = readings.RemoveAll(reading => reading.Id == id) > 0;
            if (removed)
            {
                await WriteUnlockedAsync(readings, cancellationToken);
            }

            return removed;
        }
        finally
        {
            _gate.Release();
        }
    }

    public async Task DeleteAllAsync(CancellationToken cancellationToken = default)
    {
        await _gate.WaitAsync(cancellationToken);
        try
        {
            await WriteUnlockedAsync([], cancellationToken);
        }
        finally
        {
            _gate.Release();
        }
    }

    private async Task<IReadOnlyList<PowerReading>> ReadUnlockedAsync(CancellationToken cancellationToken)
    {
        if (!File.Exists(_filePath))
        {
            return [];
        }

        await using var file = new FileStream(_filePath, FileMode.Open, FileAccess.Read, FileShare.Read,
            bufferSize: 16_384, FileOptions.Asynchronous | FileOptions.SequentialScan);
        var data = await JsonSerializer.DeserializeAsync<StoreDocument>(file, JsonOptions, cancellationToken);
        if (data is null || data.SchemaVersion != 1 || data.Readings is null)
        {
            throw new InvalidDataException("The local readings file is not a supported Power Monitor Lab data file.");
        }

        return data.Readings;
    }

    private async Task WriteUnlockedAsync(List<PowerReading> readings, CancellationToken cancellationToken)
    {
        var directory = Path.GetDirectoryName(_filePath)!;
        Directory.CreateDirectory(directory);
        var temporaryPath = _filePath + ".tmp";
        await using (var file = new FileStream(temporaryPath, FileMode.Create, FileAccess.Write, FileShare.None,
            bufferSize: 16_384, FileOptions.Asynchronous | FileOptions.WriteThrough))
        {
            await JsonSerializer.SerializeAsync(file, new StoreDocument(1, readings), JsonOptions, cancellationToken);
            await file.FlushAsync(cancellationToken);
            file.Flush(flushToDisk: true);
        }

        File.Move(temporaryPath, _filePath, overwrite: true);
    }

    private sealed record StoreDocument(int SchemaVersion, List<PowerReading> Readings);
}
