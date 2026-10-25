# Power Monitor Lab

Power Monitor Lab is a local-first notebook for power readings and estimated energy use. The npm CLI starts a small HTTP server on `127.0.0.1` and opens the interface in the default browser. It has no cloud service, account, third-party runtime dependency, or native desktop shell.

## Run from npm

Requires Node.js 22 or later.

```sh
npx power-monitor-lab
```

Or install the command globally:

```sh
npm install --global power-monitor-lab
power-monitor-lab
```

The CLI prints the local URL, chooses an available port automatically, and opens the default browser. Stop the server with **Ctrl+C**. Use `--no-open` to print the URL without launching a browser, or `--port 4317` to request a specific loopback port.

## What it does

- Records manually entered watt readings for a named meter or device, with an optional note.
- Shows the latest reading, power trend, history, and meter/time-range filters.
- Estimates watt-hours by trapezoidal integration between nearby readings from the same meter and app session.
- Omits gaps over 30 minutes and intervals whose wall-clock and monotonic times disagree. It does not bridge restarts or guess power during missing data.
- Exports the selected readings to UTF-8 CSV. Untrusted text cells are escaped and protected from spreadsheet formula execution.
- Supports English and Vietnamese.

**Measurement boundary:** values are copied from an external meter. This package does not read hardware sensors or invent live wattage. Energy is an estimate calculated from the values entered, not a direct utility-meter measurement.

## Local data and privacy

The server binds only to IPv4 loopback (`127.0.0.1`) on an OS-assigned port by default. It checks the request host and the origin of state-changing requests, limits JSON request size, serves only the bundled UI files, and sends a restrictive content security policy. The CLI makes no third-party network requests; opening the browser uses the operating system's default URL handler.

Readings are stored as JSON under the current user's application data folder:

- Windows: `%LOCALAPPDATA%\PowerMonitorLab\readings.json`
- macOS: `~/Library/Application Support/PowerMonitorLab/readings.json`
- Linux: `$XDG_DATA_HOME/power-monitor-lab/readings.json`, or `~/.local/share/power-monitor-lab/readings.json`

Set `POWER_MONITOR_DATA_DIR` to choose another folder. The file is not encrypted by the app. Export a CSV or back up `readings.json` before moving or resetting the device.

History written by the earlier Windows preview remains readable. Its .NET monotonic-clock values are not converted to Node.js clock values, so watt-hours are calculated only for intervals recorded by this npm version.

## Run from a checkout

No package installation is needed for development:

```sh
npm start
npm run check
npm pack --dry-run
```

The package has no runtime dependencies. CI checks syntax and the npm tarball contents on Windows and Linux using Node.js 22 and 24.

## License

The repository currently has no usage license. The package metadata is set to `UNLICENSED`; publishing it to npm does not grant permission to reuse, modify, or redistribute the code. Choose and add a license before presenting this as an open-source package.

To publish after choosing the package's license, authenticate with `npm login`, inspect the files using `npm pack --dry-run`, then run `npm publish --access public`.

## Tiếng Việt

Power Monitor Lab là sổ theo dõi số đo điện chạy hoàn toàn trên máy người dùng. Lệnh npm mở giao diện web trong trình duyệt mặc định và chạy máy chủ chỉ lắng nghe trên `127.0.0.1`.

```sh
npx power-monitor-lab
```

Yêu cầu Node.js 22 trở lên. Máy chủ tự chọn cổng local, in địa chỉ truy cập và mở trình duyệt. Nhấn **Ctrl+C** để dừng. Có thể dùng `--no-open` để chỉ in địa chỉ hoặc `--port 4317` để yêu cầu cổng cụ thể.

Ứng dụng cho nhập thủ công số W từ đồng hồ ngoài, lưu lịch sử JSON cục bộ, lọc theo đồng hồ/khoảng thời gian, xem xu hướng và xuất CSV. Wh được ước tính từ các số đo gần nhau trong cùng phiên chạy; khoảng trống dài hoặc thời gian bị lệch sẽ không được nội suy. Chưa có tích hợp cảm biến tự động.

Dữ liệu nằm tại `%LOCALAPPDATA%\PowerMonitorLab\readings.json` trên Windows, `~/Library/Application Support/PowerMonitorLab/readings.json` trên macOS, hoặc `$XDG_DATA_HOME/power-monitor-lab/readings.json` trên Linux. Có thể đặt `POWER_MONITOR_DATA_DIR` để đổi thư mục.

Lịch sử từ bản Windows thử nghiệm trước vẫn xem được. Giá trị đồng hồ đơn điệu cũ của .NET không được quy đổi sang Node.js, vì vậy Wh chỉ được tính cho các khoảng đo ghi bằng bản npm này.

Mã nguồn hiện chưa có giấy phép sử dụng; package ghi `UNLICENSED`. Việc đưa lên npm không tự cấp quyền sử dụng lại, sửa đổi hoặc phân phối mã nguồn. Hãy chọn và thêm giấy phép trước khi công bố đây là gói mã nguồn mở.

Sau khi chọn giấy phép, đăng nhập bằng `npm login`, kiểm tra tệp phát hành bằng `npm pack --dry-run`, rồi chạy `npm publish --access public`.
