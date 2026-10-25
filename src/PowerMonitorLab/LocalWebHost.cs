using System.Globalization;
using System.Net;
using System.Diagnostics;
using System.IO;
using System.Text;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Hosting.Server.Features;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace PowerMonitorLab;

public sealed class LocalWebHost : IAsyncDisposable
{
    private static readonly Guid ProcessSessionId = Guid.NewGuid();
    private readonly WebApplication _application;
    private readonly ReadingStore _store;
    private int _port;

    private LocalWebHost(WebApplication application, ReadingStore store)
    {
        _application = application;
        _store = store;
    }

    public string Origin { get; private set; } = string.Empty;

    public static async Task<LocalWebHost> StartAsync(CancellationToken cancellationToken = default)
    {
        var store = new ReadingStore();
        var builder = WebApplication.CreateBuilder(new WebApplicationOptions
        {
            ContentRootPath = AppContext.BaseDirectory,
            WebRootPath = Path.Combine(AppContext.BaseDirectory, "wwwroot")
        });

        builder.Logging.ClearProviders();
        builder.Logging.AddDebug();
        builder.WebHost.ConfigureKestrel(server => server.Listen(IPAddress.Loopback, 0));
        builder.Services.AddSingleton(store);

        var application = builder.Build();
        var host = new LocalWebHost(application, store);

        application.Use(async (context, next) =>
        {
            var request = context.Request;
            var localAddress = context.Connection.LocalIpAddress;
            if (localAddress is null || !IPAddress.IsLoopback(localAddress) ||
                !string.Equals(request.Host.Host, IPAddress.Loopback.ToString(), StringComparison.OrdinalIgnoreCase) ||
                (host._port != 0 && request.Host.Port != host._port))
            {
                context.Response.StatusCode = StatusCodes.Status400BadRequest;
                return;
            }

            context.Response.Headers["Content-Security-Policy"] =
                "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";
            context.Response.Headers["X-Content-Type-Options"] = "nosniff";
            context.Response.Headers["Referrer-Policy"] = "no-referrer";
            context.Response.Headers["X-Frame-Options"] = "DENY";
            context.Response.Headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()";

            if ((HttpMethods.IsPost(request.Method) || HttpMethods.IsDelete(request.Method) || HttpMethods.IsPut(request.Method)) &&
                !string.Equals(request.Headers["Origin"].ToString(), host.Origin, StringComparison.OrdinalIgnoreCase))
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                return;
            }

            await next();
        });

        application.UseDefaultFiles();
        application.UseStaticFiles();
        MapApi(application, store);
        application.MapFallbackToFile("index.html");

        await application.StartAsync(cancellationToken);
        var addresses = application.Services.GetRequiredService<IServer>()
            .Features.Get<IServerAddressesFeature>()?.Addresses;
        var address = addresses?.Select(value => new Uri(value))
            .FirstOrDefault(value => IPAddress.TryParse(value.Host, out var ip) && IPAddress.IsLoopback(ip));
        if (address is null)
        {
            await application.DisposeAsync();
            throw new InvalidOperationException("The local-only web server did not report its loopback address.");
        }

        host._port = address.Port;
        host.Origin = $"http://127.0.0.1:{address.Port}";
        return host;
    }

    public Task StopAsync(CancellationToken cancellationToken = default) => _application.StopAsync(cancellationToken);

    public ValueTask DisposeAsync() => _application.DisposeAsync();

    private static void MapApi(WebApplication application, ReadingStore store)
    {
        application.MapGet("/health", () => Results.Ok(new { status = "ok", product = "Power Monitor Lab" }));

        application.MapGet("/api/meters", async (CancellationToken cancellationToken) =>
        {
            var readings = await store.GetAllAsync(cancellationToken);
            var names = readings.Select(reading => reading.MeterName)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .Order(StringComparer.OrdinalIgnoreCase);
            return Results.Ok(names);
        });

        application.MapGet("/api/readings", async (string? meter, string? range, CancellationToken cancellationToken) =>
        {
            var readings = await store.GetAllAsync(cancellationToken);
            var (from, to) = ReadRange(range);
            var selected = Filter(readings, meter)
                .Where(reading => reading.RecordedAtUtc >= from && reading.RecordedAtUtc <= to)
                .OrderByDescending(reading => reading.RecordedAtUtc)
                .Take(2000);
            return Results.Ok(selected);
        });

        application.MapGet("/api/summary", async (string? meter, string? range, CancellationToken cancellationToken) =>
        {
            var readings = await store.GetAllAsync(cancellationToken);
            var (from, to) = ReadRange(range);
            return Results.Ok(PowerMetrics.Summarize(readings, meter, from, to));
        });

        application.MapPost("/api/readings", async (ReadingInput input, CancellationToken cancellationToken) =>
        {
            if (!double.IsFinite(input.Watts) || input.Watts < 0 || input.Watts > 100_000)
            {
                return Results.ValidationProblem(new Dictionary<string, string[]>
                {
                    ["watts"] = ["Enter a power value between 0 and 100,000 W."]
                });
            }

            var meterName = input.MeterName?.Trim();
            if (string.IsNullOrWhiteSpace(meterName) || meterName.Length > 100)
            {
                return Results.ValidationProblem(new Dictionary<string, string[]>
                {
                    ["meterName"] = ["Enter a meter or device name up to 100 characters."]
                });
            }

            if (input.Note?.Length > 250)
            {
                return Results.ValidationProblem(new Dictionary<string, string[]>
                {
                    ["note"] = ["Keep notes to 250 characters or fewer."]
                });
            }

            var reading = new PowerReading(
                Guid.NewGuid(), 1, meterName, input.Watts, DateTimeOffset.UtcNow,
                ProcessSessionId, Stopwatch.GetTimestamp(),
                "Manual reading", input.Note?.Trim());
            await store.AddAsync(reading, cancellationToken);
            return Results.Created($"/api/readings/{reading.Id}", reading);
        });

        application.MapDelete("/api/readings/{id:guid}", async (Guid id, CancellationToken cancellationToken) =>
        {
            var removed = await store.DeleteAsync(id, cancellationToken);
            return removed ? Results.NoContent() : Results.NotFound();
        });

        application.MapDelete("/api/readings", async (CancellationToken cancellationToken) =>
        {
            await store.DeleteAllAsync(cancellationToken);
            return Results.NoContent();
        });

        application.MapGet("/api/export.csv", async (string? meter, string? range, CancellationToken cancellationToken) =>
        {
            var readings = await store.GetAllAsync(cancellationToken);
            var (from, to) = ReadRange(range);
            var selected = Filter(readings, meter)
                .Where(reading => reading.RecordedAtUtc >= from && reading.RecordedAtUtc <= to)
                .OrderBy(reading => reading.RecordedAtUtc);
            var csv = new StringBuilder("schema_version,reading_id,recorded_at_utc,session_id,monotonic_timestamp_ticks,meter,watts,unit,source,note\r\n");
            foreach (var reading in selected)
            {
                csv.Append(reading.SchemaVersion.ToString(CultureInfo.InvariantCulture)).Append(',')
                    .Append(Csv(reading.Id.ToString("D"))).Append(',')
                    .Append(Csv(reading.RecordedAtUtc.ToString("O", CultureInfo.InvariantCulture))).Append(',')
                    .Append(Csv(reading.SessionId.ToString("D"))).Append(',')
                    .Append(reading.MonotonicTimestampTicks.ToString(CultureInfo.InvariantCulture)).Append(',')
                    .Append(Csv(reading.MeterName)).Append(',')
                    .Append(reading.Watts.ToString("0.###", CultureInfo.InvariantCulture)).Append(',')
                    .Append("W,")
                    .Append(Csv(reading.Source)).Append(',')
                    .Append(Csv(reading.Note ?? string.Empty)).Append("\r\n");
            }

            return Results.File(Encoding.UTF8.GetPreamble().Concat(Encoding.UTF8.GetBytes(csv.ToString())).ToArray(),
                "text/csv; charset=utf-8", "power-monitor-readings.csv");
        });
    }

    private static IEnumerable<PowerReading> Filter(IEnumerable<PowerReading> readings, string? meter) =>
        string.IsNullOrWhiteSpace(meter)
            ? readings
            : readings.Where(reading => string.Equals(reading.MeterName, meter.Trim(), StringComparison.OrdinalIgnoreCase));

    private static (DateTimeOffset From, DateTimeOffset To) ReadRange(string? range)
    {
        var now = DateTimeOffset.UtcNow;
        var length = range?.ToLowerInvariant() switch
        {
            "7d" => TimeSpan.FromDays(7),
            "30d" => TimeSpan.FromDays(30),
            _ => TimeSpan.FromHours(24)
        };
        return (now - length, now);
    }

    private static string Csv(string value)
    {
        var firstMeaningfulCharacter = value.TrimStart('\uFEFF').TrimStart();
        if (firstMeaningfulCharacter.Length > 0 && firstMeaningfulCharacter[0] is '=' or '+' or '-' or '@')
        {
            value = "'" + value;
        }

        return $"\"{value.Replace("\"", "\"\"", StringComparison.Ordinal)}\"";
    }
}
