# Power Monitor Lab

Power Monitor Lab is a local-first computer power monitor and reading notebook. The npm CLI starts a small HTTP server on `127.0.0.1` and opens the interface in the default browser. It has no cloud service, account, third-party npm runtime dependency, or native desktop shell.

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

- On Windows, discovers hardware exposed through the Windows Energy Metering Interface (EMI) and shows cumulative energy channels with average watts between samples.
- On Windows, reads the last measured GPU board power from `nvidia-smi` when an NVIDIA driver provides it.
- Lists hardware devices Windows can identify, including the processor, graphics, memory, drives, monitors, keyboards, mice, and USB devices; marks devices without live watt telemetry.
- Records manually entered watt readings for a named meter or device, with an optional note.
- Shows the latest reading, power trend, history, and meter/time-range filters.
- Estimates watt-hours by trapezoidal integration between nearby readings from the same meter and app session.
- Omits gaps over 30 minutes and intervals whose wall-clock and monotonic times disagree. It does not bridge restarts or guess power during missing data.
- Exports the selected readings to UTF-8 CSV. Untrusted text cells are escaped and protected from spreadsheet formula execution.
- Supports English and Vietnamese.

**Measurement boundary:** hardware readings depend on sensors and vendor drivers installed on the computer. The DRAM channel is a shared memory domain and does not measure each DIMM separately. A device is marked measured only when telemetry can be tied to that exact device. EMI channels are separate domains and can overlap; the app shows each channel independently and never adds them into a whole-PC total. `nvidia-smi` reports the latest GPU board draw, not the computer's wall input. Windows does not expose live watts for every keyboard, mouse, drive, fan, display, or motherboard. A wall outlet power meter is required for whole-computer input power, and inline USB meters are required to isolate USB peripherals. On macOS/Linux, manual readings remain available but automatic hardware power sensing is not currently implemented.

Sensor energy is observed only while this local app process is running. It resets when the server stops and is kept separate from manually logged readings. If a device or driver does not expose live power, the app labels it as detected without a watt sensor instead of estimating a value.

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

The package has no npm runtime dependencies. Windows hardware discovery uses the built-in Windows PowerShell helper and supported vendor tools already present on the computer. CI checks syntax and the npm tarball contents on Windows and Linux using Node.js 22 and 24.

## License

The repository currently has no usage license. The package metadata is set to `UNLICENSED`; publishing it to npm does not grant permission to reuse, modify, or redistribute the code. Choose and add a license before presenting this as an open-source package.

To publish after choosing the package's license, authenticate with `npm login`, inspect the files using `npm pack --dry-run`, then run `npm publish --access public`.

## Tiếng Việt

Power Monitor Lab là ứng dụng theo dõi công suất máy tính và sổ lưu số đo cục bộ. Lệnh npm mở giao diện web trong trình duyệt mặc định và chạy máy chủ chỉ lắng nghe trên `127.0.0.1`.

```sh
npx power-monitor-lab
```

Yêu cầu Node.js 22 trở lên. Máy chủ tự chọn cổng local, in địa chỉ truy cập và mở trình duyệt. Nhấn **Ctrl+C** để dừng. Có thể dùng `--no-open` để chỉ in địa chỉ hoặc `--port 4317` để yêu cầu cổng cụ thể.

Trên Windows, ứng dụng tự dò các kênh năng lượng mà Windows EMI cung cấp và đọc công suất card NVIDIA qua `nvidia-smi` nếu driver có hỗ trợ. Ứng dụng liệt kê các thiết bị Windows nhận diện được, gồm CPU, card đồ họa, RAM, ổ đĩa, màn hình, bàn phím, chuột và thiết bị USB; thiết bị không có cảm biến watt sẽ được ghi rõ.

**Giới hạn đo:** kênh DRAM là miền bộ nhớ dùng chung, không đo riêng từng thanh RAM. Thiết bị chỉ được đánh dấu có số đo khi dữ liệu cảm biến gắn được với đúng thiết bị. Kênh EMI có thể chồng lấp nên được hiển thị riêng, không cộng thành tổng công suất toàn PC. `nvidia-smi` báo công suất card đồ họa tại lần đo gần nhất, không phải điện đầu vào tại ổ cắm. Windows không cung cấp số watt trực tiếp cho mọi chuột, bàn phím, ổ đĩa, quạt, màn hình hoặc bo mạch. Cần đồng hồ đo ở ổ cắm để đo tổng máy và đồng hồ USB nối tiếp để đo riêng thiết bị USB. Trên macOS/Linux, ứng dụng vẫn cho nhập số thủ công nhưng chưa có đọc cảm biến tự động.

Năng lượng cảm biến chỉ được ghi nhận khi máy chủ ứng dụng đang chạy và không được lưu qua lần khởi động lại. Số đo cảm biến tách khỏi số nhập thủ công; ứng dụng không tự đoán watt khi thiết bị hoặc driver không cung cấp dữ liệu.

Dữ liệu nằm tại `%LOCALAPPDATA%\PowerMonitorLab\readings.json` trên Windows, `~/Library/Application Support/PowerMonitorLab/readings.json` trên macOS, hoặc `$XDG_DATA_HOME/power-monitor-lab/readings.json` trên Linux. Có thể đặt `POWER_MONITOR_DATA_DIR` để đổi thư mục.

Lịch sử từ bản Windows thử nghiệm trước vẫn xem được. Giá trị đồng hồ đơn điệu cũ của .NET không được quy đổi sang Node.js, vì vậy Wh chỉ được tính cho các khoảng đo ghi bằng bản npm này.

Mã nguồn hiện chưa có giấy phép sử dụng; package ghi `UNLICENSED`. Việc đưa lên npm không tự cấp quyền sử dụng lại, sửa đổi hoặc phân phối mã nguồn. Hãy chọn và thêm giấy phép trước khi công bố đây là gói mã nguồn mở.

Sau khi chọn giấy phép, đăng nhập bằng `npm login`, kiểm tra tệp phát hành bằng `npm pack --dry-run`, rồi chạy `npm publish --access public`.
