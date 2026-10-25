# Power Monitor Lab

Power Monitor Lab is a local-first computer power monitor. The npm CLI starts a small HTTP server on `127.0.0.1` and opens the interface in the default browser. It has no cloud service, account, third-party npm runtime dependency, or native desktop shell.

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
- Shows per-channel session energy where a sensor provides it; CPU, DRAM, and GPU channels stay separate and are not a whole-PC outlet total.
- On Windows, optionally reads additional hardware `Power` sensors from the local LibreHardwareMonitor web server.
- On Windows, automatically looks for compatible Shelly meters advertised on the local network, then reads whole-PC active watts and energy every three seconds. If several meters are found, choose the one connected only to the PC.
- Refreshes the live sensor dashboard automatically every three seconds while the local app is running.
- Saves finite automatic sensor readings every 30 seconds to local daily history files and shows a chart for the past hour, six hours, day, or week. History is kept for seven days.
- Lists hardware devices Windows can identify, including the processor, graphics, memory, drives, monitors, keyboards, mice, and USB devices; marks devices without live watt telemetry.
- Shows separate, sourced estimates for devices without live watt telemetry when manufacturer specifications or shared sensors support one. Other devices remain clearly marked as lacking a defensible estimate. Estimates are not sensor readings and are never added to measured values or a whole-PC total.
- Supports English and Vietnamese.

**Measurement boundary:** hardware readings depend on sensors and vendor drivers installed on the computer. The DRAM channel is a shared memory domain and does not measure each DIMM separately. A device is marked measured only when telemetry can be tied to that exact device. EMI channels are separate domains and can overlap; the app shows each channel independently and never adds them into a whole-PC total. `nvidia-smi` reports the latest GPU board draw, not the computer's wall input. Windows does not expose live watts for every keyboard, mouse, drive, fan, display, or motherboard. Whole-PC input power requires a real AC outlet meter dedicated to the PC; without one, the total remains unavailable. Inline USB meters are required to isolate USB peripherals. On macOS/Linux, automatic hardware power sensing is not implemented; the dashboard reports the unsupported state.

Sensor cards show separate per-channel energy for the current app session when available. The whole-PC card shows the outlet meter's cumulative kWh counter when connected; that value follows the meter's own reset behavior.

### Per-device measurement routes

| Part | Source available on this PC | Meter needed when no live source exists |
| --- | --- | --- |
| CPU | Windows EMI provides package and PP0 energy domains; PP0 covers processor cores as one domain, not each core. | None for these reported domains. |
| NVIDIA graphics card | `nvidia-smi` / NVML reports the last GPU board power reading, including circuitry on the card. | None while the driver exposes power readings. |
| RAM | EMI reports one shared DRAM domain, not separate DIMM wattage. LibreHardwareMonitor may expose additional power channels when supported by the CPU/board sensors. | Per-DIMM power needs specialized DIMM rail instrumentation. |
| Storage | Windows exposes no live watts for the two SATA SSDs in this PC. LibreHardwareMonitor is checked for any drive `Power` sensors, but storage devices commonly expose temperature/activity rather than watts. | An inline DC watt meter on each drive's SATA power lead, or model-specific firmware telemetry. Some NVMe 2.3 drives can optionally report one-second interval power, but this PC has no NVMe drive and the app does not query that log yet. |
| Monitors | DDC/CI exposes display controls and status, not a general live watt reading. | A true-watt AC outlet meter for each monitor. |
| Keyboard, mouse, USB device | USB descriptors declare a maximum current, not the current being drawn now. | A data-pass-through inline USB power meter on each USB power path. A composite device or shared receiver is measured as one branch; a wireless keyboard or mouse draws from its own battery, not the PC's receiver port. |
| Motherboard, fan, network and audio | The H510M-HVS reports rail voltages and fan RPM, not per-part current or watts. | Rail-level DC instrumentation for a subcomponent; a true-watt AC meter at the PC outlet for the complete tower. |
| Whole PC | Internal CPU/GPU readings overlap and do not include every rail. | A true-watt AC outlet meter on the tower's power cable. A meter on a shared strip includes every device plugged into that strip. |

`bMaxPower` is the USB device's declared maximum, not a live measurement. Power readings for the CPU and GPU are component domains; they cannot be added to recover wall input. Sources: [Windows EMI](https://learn.microsoft.com/en-us/windows-hardware/drivers/powermeter/energy-meter-interface), [Intel RAPL domains](https://cdrdv2-public.intel.com/868137/325462-089-sdm-vol-1-2abcd-3abcd-4.pdf), [NVIDIA NVML power usage](https://docs.nvidia.com/deploy/nvml-api/latest/api/group__nvmlDeviceQueries.html), [USB-IF descriptor](https://www.usb.org/sites/default/files/pdcv10.pdf), [NVMe 2.3](https://nvmexpress.org/wp-content/uploads/NVM-Express-Base-Specification-Revision-2.3-2025.08.01-Ratified.pdf), and [ASRock H510M-HVS specifications](https://www.asrock.com/MB/Intel/H510M-HVS/index.asp).

### Optional whole-PC outlet meter (Windows)

The app listens for Shelly Gen2+ devices advertising `_shelly._tcp.local` on the local network. When one compatible meter is found, it automatically reads the read-only `GET /rpc/Shelly.GetStatus` endpoint. It uses the meter's `apower` field as active watts and `aenergy.total` as the absolute Wh counter. The meter must be dedicated to the PC's power cable; a shared strip would include every connected device. When the meter requires authentication, verify its displayed local IP and enter its password in the dashboard. The password stays in memory until the app closes. No watt value is entered manually.

```powershell
npx power-monitor-lab
```

Discovery sends only a local mDNS service query; it does not scan IP ranges or contact the internet. If multiple devices or meter channels are found, select the device/channel dedicated to the PC in the dashboard. Advanced users can set `POWER_MONITOR_PC_METER_HOST`, `POWER_MONITOR_PC_METER_PASSWORD`, `POWER_MONITOR_PC_METER_COMPONENT`, and optionally `POWER_MONITOR_PC_METER_CERTIFICATE_SHA256` to bypass discovery. Use a meter whose plug, mains voltage, and rated load are appropriate for the PC power supply. Shelly devices with factory-enabled HTTPS redirect local RPC requests to HTTPS. The app follows only redirects to the same private IPv4 address and exact read-only status path. On first use, the app shows the certificate's SHA-256 fingerprint and waits for you to trust it; it sends no meter password until that certificate is pinned in memory. Before sending Digest authentication, it reads `Shelly.GetDeviceInfo` without credentials and requires the challenge realm to match that device's reported ID. A certificate change requires a new confirmation. Older Shelly devices that stay on HTTP still use unencrypted local traffic, so keep them on a trusted private network. Without a compatible outlet meter, whole-PC input watts remain unavailable; CPU and GPU sensor readings continue updating automatically.

### Separate device estimate mode

The sensor API attaches a `powerEstimate` object to each detected device without changing the `readings` array. The UI renders estimates in a separate column and labels their type and confidence. They are not persisted, graphed, integrated into watt-hours, or summed into a whole-PC figure.

The API also exposes `measuredSubtotalWatts` and `measuredSubtotalChannelCount`, which sum only the live CPU package and discrete NVIDIA GPU channels selected by the component energy tracker. This is a partial component subtotal; `totalPowerWatts` stays `null` until a dedicated PC outlet meter measures AC input.

- The two DIMM estimates allocate the measured shared DRAM channel by installed capacity. They do not represent per-DIMM telemetry.
- The Kingston A400 range uses the published idle/read/write figures. When Windows exposes physical-disk byte rates, a linear throughput model estimates a point within that specification range. This is a low-confidence model, not a watt sensor.
- The Hikvision/HIKSEMI E100 shows the manufacturer's maximum-power envelope only because no idle value for this unit was verified.
- The Dell E2318H shows the manufacturer on-mode and sleep reference range; current state is not read. The HKC MB24V9 entry shows only its family adapter's 24–30 W output rating. A 17.06 W reference is from a comparable model, not this monitor.
- Components without a device-specific source or live sensor (motherboard, USB HID, network, audio, fans, and unknown models) remain explicitly unavailable instead of receiving invented watt ranges. Integrated NVIDIA audio is linked to the measured GPU board reading.
- An estimate or specification limit is not a measured current draw. Unknown power states, device revisions, peripherals and workloads can move actual use outside these models. No estimated whole-PC total is produced.

Model sources: [Kingston A400 specification](https://www.kingston.com/datasheets/sa400s37_us.pdf), [HIKSEMI E100 specification](https://www.hiksemitech.com/pt/hiksemi/all-products/solid-state-drive/consumer-ssd/hs-ssd-e100.html), [Dell E2318H specification](https://i.dell.com/sites/csdocuments/Product_Docs/en/dell_23_monitor_e2318h_product_spec_sheet.pdf), [comparable HKC ENERGY STAR display](https://www.energystar.gov/productfinder/product/certified-displays/details/4497038/export/pdf), and [HKC MB24V9 family certification](https://www.cqc.com.cn/www/upload/files/upload/resources/file/2025/05/19/63005.pdf).

### Optional LibreHardwareMonitor source (Windows)

The app polls only `GET http://127.0.0.1:8085/data.json`; it imports finite sensors whose type is `Power` and never calls LibreHardwareMonitor's control endpoints. To enable it, install and run [LibreHardwareMonitor](https://github.com/LibreHardwareMonitor/LibreHardwareMonitor), then choose **Options → Remote Web Server → Run**. If you use another local port, set `POWER_MONITOR_LHM_PORT` before starting the app. The app does not install a sensor driver or elevate itself; some motherboard sensors require LibreHardwareMonitor to run with administrator rights. Only power sensors the hardware/driver exposes appear, and a shared CPU/DRAM channel still does not measure each DIMM or USB HID device. On this PC, LibreHardwareMonitor is not installed or running, so this optional provider currently contributes no readings.
Live sensors refresh automatically while this local app process runs. The dashboard shows energy for each channel since the app started; EMI energy comes from counter deltas, while other providers are integrated from successive readings. Automatic sensor samples are appended every 30 seconds and retained for seven days. Session energy still resets when the server stops. Devices without watt sensors may show a separately labeled model estimate; estimates never become sensor readings or history samples.

On Windows, the detected hardware inventory refreshes every 15 seconds so devices added or removed while the app is open appear without restarting it.

## Local data and privacy

The server binds only to IPv4 loopback (`127.0.0.1`) on an OS-assigned port by default. It checks the request host and the origin of state-changing requests, serves only the bundled UI files, and sends a restrictive content security policy. On Windows, the app sends a local mDNS query for Shelly's advertised service, then makes read-only requests to discovered private IPv4 addresses; it does not scan IP ranges or contact the internet. For Shelly HTTPS, the app pins the user-confirmed certificate fingerprint for the current app session and checks `Shelly.GetDeviceInfo` before sending authentication. Older devices that stay on HTTP use unencrypted local traffic, so keep them on a trusted network.

Manual readings and their history API are removed. Legacy `/api/readings`, `/api/meters`, `/api/summary`, and `/api/export.csv` routes are no longer served. Existing `readings.json` files are not imported or read. Automatic sensor samples are saved to daily `.jsonl` files in a `sensor-history` subfolder, kept for seven days, and contain only finite readings from hardware sensors; estimates are never stored:

- Windows: `%LOCALAPPDATA%\PowerMonitorLab\sensor-history\YYYY-MM-DD.jsonl`
- macOS: `~/Library/Application Support/PowerMonitorLab/sensor-history/YYYY-MM-DD.jsonl`
- Linux: `$XDG_DATA_HOME/power-monitor-lab/sensor-history/YYYY-MM-DD.jsonl`, or `~/.local/share/power-monitor-lab/sensor-history/YYYY-MM-DD.jsonl`

Set `POWER_MONITOR_DATA_DIR` to choose another folder for automatic sensor history. The files are local and are not encrypted by the app. The dashboard reads live values from available hardware sensors while the app runs and creates history without manual records.

## Run from a checkout

No package installation is needed for development:

```sh
npm start
npm run check
npm test
npm pack --dry-run
```

The package has no npm runtime dependencies. Windows hardware discovery uses the built-in Windows PowerShell helper and supported vendor tools already present on the computer. CI checks syntax and the npm tarball contents on Windows and Linux using Node.js 22 and 24.

## License

The repository currently has no usage license. The package metadata is set to `UNLICENSED`; publishing it to npm does not grant permission to reuse, modify, or redistribute the code. Choose and add a license before presenting this as an open-source package.

To publish after choosing the package's license, authenticate with `npm login`, inspect the files using `npm pack --dry-run`, then run `npm publish --access public`.

## Tiếng Việt

Power Monitor Lab là ứng dụng theo dõi công suất máy tính với số đo cảm biến tự cập nhật. Lệnh npm mở giao diện web trong trình duyệt mặc định và chạy máy chủ chỉ lắng nghe trên `127.0.0.1`.

```sh
npx power-monitor-lab
```

Yêu cầu Node.js 22 trở lên. Máy chủ tự chọn cổng local, in địa chỉ truy cập và mở trình duyệt. Nhấn **Ctrl+C** để dừng. Có thể dùng `--no-open` để chỉ in địa chỉ hoặc `--port 4317` để yêu cầu cổng cụ thể.

Trên Windows, ứng dụng tự dò các kênh năng lượng mà Windows EMI cung cấp và đọc công suất card NVIDIA qua `nvidia-smi` nếu driver có hỗ trợ. Ứng dụng cũng đọc thêm cảm biến `Power` từ LibreHardwareMonitor nếu máy chủ cục bộ đang chạy, và tự tìm đồng hồ Shelly tương thích trong mạng nội bộ để đo điện đầu vào toàn PC. Dashboard tự cập nhật số đo mỗi ba giây khi ứng dụng đang chạy; không có chỗ nhập watt thủ công.

**Giới hạn đo:** kênh DRAM là miền bộ nhớ dùng chung, không đo riêng từng thanh RAM. Thiết bị chỉ được đánh dấu có số đo khi dữ liệu cảm biến gắn được với đúng thiết bị. Kênh EMI có thể chồng lấp nên được hiển thị riêng, không cộng thành tổng công suất toàn PC. `nvidia-smi` báo công suất card đồ họa tại lần đo gần nhất, không phải điện đầu vào tại ổ cắm. Windows không cung cấp số watt trực tiếp cho mọi chuột, bàn phím, ổ đĩa, quạt, màn hình hoặc bo mạch. Cần đồng hồ AC cắm riêng PC và cấu hình một lần để tự đọc tổng; nếu chưa có đồng hồ, tổng vẫn để trống. Đồng hồ USB nối tiếp cần thiết để đo riêng thiết bị USB. Trên macOS/Linux, tính năng đo cảm biến tự động chưa được hỗ trợ và dashboard sẽ báo trạng thái này.

Danh sách thiết bị Windows được dò lại mỗi 15 giây để nhận thiết bị vừa cắm hoặc rút mà không cần khởi động lại ứng dụng.

### Cách đo theo từng phần

| Phần cứng | Nguồn đang có trên PC này | Đồng hồ cần dùng nếu chưa có số đo trực tiếp |
| --- | --- | --- |
| CPU | Windows EMI báo miền năng lượng package và PP0; PP0 gộp các lõi CPU, không tách từng lõi. | Không cần cho các miền đang được báo. |
| Card NVIDIA | `nvidia-smi` / NVML báo lần đo công suất bo mạch card gần nhất, gồm mạch trên card. | Không cần khi driver còn cung cấp số đo. |
| RAM | EMI chỉ báo miền DRAM dùng chung, không tách watt từng thanh. LibreHardwareMonitor có thể cung cấp thêm kênh công suất nếu cảm biến CPU/bo mạch hỗ trợ. | Muốn đo riêng từng thanh cần thiết bị đo chuyên dụng trên đường nguồn DIMM. |
| Ổ lưu trữ | Hai ổ vật lý của PC này là SSD SATA; Windows không báo watt trực tiếp. Ứng dụng kiểm tra thêm cảm biến `Power` từ LibreHardwareMonitor nếu ổ có cung cấp. | Đồng hồ DC nối tiếp trên dây nguồn SATA của từng ổ hoặc telemetry riêng của firmware. Một số ổ NVMe 2.3 hỗ trợ tùy chọn đo công suất trung bình 1 giây, nhưng PC này không có ổ NVMe và ứng dụng chưa đọc log đó. |
| Màn hình | DDC/CI cho phép đọc/điều khiển một số thiết lập và trạng thái, không phải đồng hồ watt tổng quát. | Đồng hồ AC đo watt thật cho từng màn hình. |
| Bàn phím, chuột, USB | Descriptor USB chỉ khai báo dòng tối đa, không cho biết dòng đang dùng. | Đồng hồ USB có truyền dữ liệu, mắc nối tiếp trên từng nhánh nguồn. Thiết bị ghép chung hoặc đầu thu chung chỉ có số đo gộp; chuột/bàn phím không dây dùng pin riêng, không lấy điện từ cổng USB của PC. |
| Bo mạch, quạt, mạng và âm thanh | H510M-HVS báo điện áp đường nguồn và RPM quạt, không báo dòng/watt từng phần. | Đo DC trên đường nguồn nếu cần tách linh kiện; đồng hồ AC ở ổ cắm đo cả thùng máy. |
| Cả PC | Số CPU/GPU có miền chồng lấp và không bao phủ mọi đường nguồn. | Đồng hồ AC đo watt thật ở dây nguồn của thùng máy. Nếu đồng hồ cắm vào ổ chia chung thì nó đo tất cả thiết bị trên ổ chia đó. |

`bMaxPower` của USB là mức tối đa khai báo, không phải số đo trực tiếp. Không cộng số CPU/GPU để suy ra điện ở ổ cắm.

### Ước tính công suất theo thiết bị

API `/api/sensors` bổ sung trường `powerEstimate` riêng trên từng thiết bị. Trường này không thay đổi danh sách `readings`, không được lưu vào lịch sử, biểu đồ, Wh hay tổng PC. Màn hình gắn nhãn rõ số đo, phân bổ cảm biến dùng chung, mô hình, khoảng tham khảo, giới hạn tài liệu hoặc chưa đủ căn cứ.

API cũng trả `measuredSubtotalWatts` và `measuredSubtotalChannelCount`, chỉ cộng các kênh CPU package và GPU NVIDIA rời đang đo trực tiếp. Đây là tổng phụ của một số linh kiện; `totalPowerWatts` vẫn là `null` cho đến khi đồng hồ AC riêng của PC đo điện đầu vào.

- Hai thanh RAM được phân bổ số đo DRAM dùng chung theo dung lượng. Đây không phải số đo từng DIMM và không được cộng lại với kênh DRAM gốc.
- Kingston A400 dùng thông số nhà sản xuất; khi Windows có bộ đếm I/O ổ đĩa, ứng dụng nội suy một mô hình công suất hoạt động có độ tin cậy thấp. HIKSEMI E100 chỉ hiển thị giới hạn tối đa 2,9 W vì chưa có thông số nhàn rỗi phù hợp.
- Dell E2318H hiển thị khoảng tham khảo khi bật/ngủ theo tài liệu nhưng không biết trạng thái hiện tại. HKC MB24V9 chỉ hiển thị công suất đầu ra adapter 24–30 W của họ sản phẩm; mức tham khảo 17,06 W thuộc một mẫu khác, không phải màn hình này.
- Bo mạch, USB, bàn phím, chuột, mạng, âm thanh, quạt và mẫu thiết bị không rõ nguồn vẫn hiện “chưa đủ căn cứ” thay vì gán watt phỏng đoán.

Các nguồn và giới hạn của từng mô hình được ghi cạnh thiết bị trong ứng dụng và trong mục tiếng Anh phía trên. Không có tổng công suất ước tính cho toàn PC.

### Đồng hồ đo đầu vào toàn PC (Windows)

Ứng dụng tự tìm thiết bị Shelly Gen2+ quảng bá dịch vụ `_shelly._tcp.local` trong mạng nội bộ. Khi chỉ tìm thấy một đồng hồ tương thích, app tự đọc API chỉ-đọc `GET /rpc/Shelly.GetStatus`; nếu tìm thấy nhiều thiết bị, hãy chọn đồng hồ nối riêng với PC trong dashboard. Để đo tổng PC, dây nguồn của thùng máy phải đi qua đồng hồ; ổ chia chung sẽ tính cả thiết bị khác. Nếu đồng hồ bật xác thực, nhập mật khẩu tại dashboard; mật khẩu chỉ nằm trong bộ nhớ đến khi đóng app. Không cần nhập watt thủ công.

```powershell
npx power-monitor-lab
```

App chỉ gửi truy vấn mDNS trong mạng nội bộ để tìm dịch vụ Shelly, không quét dải IP và không gọi Internet. Nếu nhiều đồng hồ hoặc kênh được tìm thấy, hãy kiểm tra IP hiển thị rồi chọn đúng đồng hồ/kênh chỉ cấp điện cho PC trước khi nhập mật khẩu. Có thể bỏ qua dò tự động bằng các biến `POWER_MONITOR_PC_METER_HOST`, `POWER_MONITOR_PC_METER_PASSWORD`, `POWER_MONITOR_PC_METER_COMPONENT`, và tùy chọn `POWER_MONITOR_PC_METER_CERTIFICATE_SHA256`. Hãy chọn đồng hồ có phích cắm, điện áp và tải định mức phù hợp với bộ nguồn PC. Với đồng hồ bật HTTPS, app chỉ theo chuyển hướng HTTPS về cùng IP nội bộ và đúng API chỉ đọc; lần đầu app hiển thị dấu vân tay SHA-256 để bạn xác nhận, sau đó mới gửi xác thực và đo tự động. Trước khi gửi Digest, app đọc `Shelly.GetDeviceInfo` không kèm mật khẩu và bắt buộc realm xác thực khớp ID của thiết bị. Chứng chỉ thay đổi sẽ yêu cầu xác nhận lại. Các thiết bị cũ chỉ có HTTP vẫn truyền dữ liệu không mã hóa trong mạng nội bộ. Tham khảo [Shelly RPC](https://shelly-api-docs.shelly.cloud/gen2/ComponentsAndServices/Shelly/), [cấu hình HTTPS Shelly](https://shelly-api-docs.shelly.cloud/gen2/General/CustomHTTPSCertificates/) và [thông số Shelly Plug PM Gen3](https://us.shelly.com/blogs/documentation/shelly-plug-pm-gen3).

### Nguồn LibreHardwareMonitor tùy chọn (Windows)

Ứng dụng chỉ gửi `GET http://127.0.0.1:8085/data.json` và chỉ nhận các cảm biến hữu hạn có loại `Power`; không gọi các API điều khiển. Để bật, cài và chạy [LibreHardwareMonitor](https://github.com/LibreHardwareMonitor/LibreHardwareMonitor), rồi chọn **Options → Remote Web Server → Run**. Nếu đổi cổng, đặt `POWER_MONITOR_LHM_PORT` trước khi mở app. Ứng dụng không tự cài driver hay chạy quyền quản trị; một số cảm biến bo mạch yêu cầu LibreHardwareMonitor chạy bằng quyền administrator. Chỉ các cảm biến watt mà thiết bị/driver thực sự cung cấp mới xuất hiện; kênh CPU/DRAM dùng chung vẫn không tách được từng thanh RAM hoặc từng thiết bị HID USB. LibreHardwareMonitor hiện không được cài/chạy trên PC này nên nguồn tùy chọn chưa có số đo.
Số đo cảm biến tự cập nhật khi máy chủ ứng dụng đang chạy. Dashboard hiển thị watt hiện tại theo từng kênh; ứng dụng tự lưu số đo cảm biến thật mỗi 30 giây và giữ lịch sử 7 ngày. Năng lượng trong phiên vẫn bắt đầu lại khi khởi động server. Ước tính không trở thành số đo cảm biến và không được lưu.

Lịch sử cảm biến tự động được lưu theo ngày trong thư mục `sensor-history` tại thư mục dữ liệu cục bộ (Windows: `%LOCALAPPDATA%\PowerMonitorLab`; macOS: `~/Library/Application Support/PowerMonitorLab`; Linux: `$XDG_DATA_HOME/power-monitor-lab` hoặc `~/.local/share/power-monitor-lab`). Lịch sử nhập tay và các API cũ (`/api/readings`, `/api/meters`, `/api/summary`, `/api/export.csv`) đã bị gỡ; tệp `readings.json` cũ không được ứng dụng đọc. Lịch sử cảm biến tự động vẫn được giữ trong bảy ngày.

Mã nguồn hiện chưa có giấy phép sử dụng; package ghi `UNLICENSED`. Việc đưa lên npm không tự cấp quyền sử dụng lại, sửa đổi hoặc phân phối mã nguồn. Hãy chọn và thêm giấy phép trước khi công bố đây là gói mã nguồn mở.

Sau khi chọn giấy phép, đăng nhập bằng `npm login`, kiểm tra tệp phát hành bằng `npm pack --dry-run`, rồi chạy `npm publish --access public`.
