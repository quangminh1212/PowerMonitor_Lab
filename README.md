# Power Monitor Lab

Power Monitor Lab is a private, local-first Windows desktop app for keeping power readings and estimating energy use. Its interface runs in WebView2 and is served by an ASP.NET Core web host bound to the IPv4 loopback address only.

> **Measurement boundary:** this release records readings entered from an external meter. It does not yet read hardware sensors automatically. Energy is calculated from the values you enter; it is an estimate, not a separate meter measurement.

## What works

- Record power in watts against a named meter or device, with an optional note.
- Review the latest reading, a power trend, and a reading history over 24 hours, 7 days, or 30 days.
- Estimate watt-hours by trapezoidal integration between consecutive readings from the same meter during the same app session. A monotonic clock is used for elapsed time, so wall-clock changes do not inflate the total. Intervals longer than 30 minutes or affected by a clock adjustment are omitted and shown as gaps; the app does not bridge app restarts, fill missing periods, or extend the last value forward.
- Filter by meter and export the selected period to UTF-8 CSV.
- Delete an individual reading or clear the local history after confirmation. Data is persisted atomically and survives app restarts.
- Switch the interface between English and Vietnamese.

## Run on Windows

### Development

Install the [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0) and the [Microsoft Edge WebView2 Evergreen Runtime](https://developer.microsoft.com/microsoft-edge/webview2/). Then run:

```powershell
dotnet run --project .\src\PowerMonitorLab\PowerMonitorLab.csproj
```

The WPF window starts a local web server on an available port and opens the UI in WebView2. The server is stopped when the app closes. The app does not require administrator privileges.

### Publish a portable Windows build

```powershell
.\scripts\publish-windows.ps1
```

The script publishes a self-contained `win-x64` folder and a ZIP archive under `artifacts\`. A .NET runtime does not need to be installed on the target PC. WebView2 Evergreen Runtime is a separate Microsoft prerequisite; install it once per PC if it is missing. The published folder can be extracted anywhere and `PowerMonitorLab.exe` can be launched directly.

## Local data and privacy

- Readings: `%LOCALAPPDATA%\PowerMonitorLab\readings.json`
- WebView2 profile: `%LOCALAPPDATA%\PowerMonitorLab\WebView2\`
- HTTP listener: `127.0.0.1` on an OS-assigned port. It does not listen on the LAN interface.
- The host checks its loopback address, expected host and port, and the origin of state-changing requests. The UI has a restrictive content security policy and makes no third-party network requests.
- The JSON file is protected by the current Windows user profile's file permissions; it is not encrypted by the app.
- Export a CSV before moving or resetting the PC if you want a portable backup. To back up the full local history, close the app and copy `readings.json`.

## Reading and energy semantics

- `Watts` is the instantaneous value that the user copied from a meter. The record also says it was entered manually.
- `Wh` is computed with the trapezoidal rule using the two endpoint watt values and a monotonic elapsed-time counter. Calculations are grouped by meter and app session so different devices are never mixed together and closed-app time is not guessed.
- A pair of readings is used only when its gap is at most 30 minutes and its wall-clock timestamps agree with the monotonic elapsed time. Longer gaps or detected clock changes are excluded. The app does not infer a value before the first reading or after the latest reading.
- A normal wall outlet, USB device, or attached peripheral does not necessarily expose actual wattage to Windows. Automatic sensor integrations need to be added for specific supported hardware; CPU usage or battery percentage is not presented as watts.

## Build requirements

- Windows x64 for the WPF/WebView2 desktop host.
- .NET 10 SDK for development and publishing.
- WebView2 Evergreen Runtime to display the app UI.

The project targets .NET 10 LTS. See Microsoft's [supported .NET releases and lifecycle](https://learn.microsoft.com/dotnet/core/releases-and-support). The WebView2 dependency follows Microsoft's [WPF setup guide](https://learn.microsoft.com/microsoft-edge/webview2/get-started/wpf).

## Tiếng Việt

Power Monitor Lab là ứng dụng Windows chạy cục bộ để lưu số đo công suất và ước tính điện năng. Giao diện chạy trong WebView2; máy chủ ASP.NET Core chỉ mở trên `127.0.0.1` và tự tắt khi đóng ứng dụng.

**Giới hạn đo lường:** phiên bản hiện tại cho nhập thủ công số đọc từ đồng hồ công suất ngoài; chưa tự đọc cảm biến phần cứng. Wh được tính từ các số W đã nhập nên là số ước tính, không phải số đo trực tiếp của công tơ. Khoảng cách giữa hai lần ghi dài hơn 30 phút sẽ bị loại khỏi phép tính.

Cài [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0) và [WebView2 Evergreen Runtime](https://developer.microsoft.com/microsoft-edge/webview2/), sau đó chạy:

```powershell
dotnet run --project .\src\PowerMonitorLab\PowerMonitorLab.csproj
```

Hoặc tạo bản Windows x64 tự chứa .NET:

```powershell
.\scripts\publish-windows.ps1
```

Dữ liệu được lưu trong `%LOCALAPPDATA%\PowerMonitorLab\readings.json`. Dùng nút **Export CSV** để xuất các số đo theo bộ lọc hiện tại.
