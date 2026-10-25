const translations = {
  en: {
    sensorSharedPowerPath: "Same Windows USB device group as: {devices}; measure its branch once.",
    workspace: "WORKSPACE", workspaceShort: "Workspace", overview: "Overview", readingLog: "Reading log",
    privateTitle: "Your data stays here", privateBody: "Saved on this PC. Nothing is sent to a cloud service.", localHost: "Local host active", onThisDevice: "On this device",
    measurementNotebook: "MEASUREMENT NOTEBOOK", title: "Power, with context.", subtitle: "A local notebook for power readings and energy estimates.",
    filterMeter: "Filter by meter", allMeters: "All meters", timeRange: "Time range", last24Hours: "Last 24 hours", last7Days: "Last 7 days", last30Days: "Last 30 days", exportCsv: "Export CSV",
    manualOnlyTitle: "Manual readings only.", manualOnlyBody: "This MVP has no automatic sensor integration. Enter readings from an external meter; the app does not invent live watt values.", honestData: "HONEST DATA",
    sensorNoticeTitle: "Automatic hardware discovery is enabled.", sensorNoticeBody: "Live readings appear only when local sensors provide real watts. Manual meter entries stay separate.", sensorNoticeTag: "HARDWARE STATUS",
    sensorEyebrow: "AUTOMATIC HARDWARE DISCOVERY", sensorHeading: "Live sensors and detected devices", sensorStatusStarting: "Discovering", sensorStatusAvailable: "Live readings", sensorStatusPartial: "Partial", sensorStatusUnavailable: "Unavailable", sensorStatusUnsupported: "Windows only",
    sensorIntro: "Looking for power readings exposed by this computer.", sensorLhmHint: "Optional: run LibreHardwareMonitor and enable its Remote Web Server on port 8085 to add any extra live power channels it exposes.", sensorProviderConnected: "connected", sensorProviderUnavailable: "not connected", sensorAvailableMessage: "Live readings are available for the hardware channels exposed by this PC.", sensorPartialMessage: "Devices were detected, but Windows did not expose a live watt sensor for them.", sensorUnavailableMessage: "No supported live hardware power sensors were found on this PC.", sensorUnsupportedMessage: "Automatic hardware readings are currently supported on Windows.", sensorReadingsHeading: "Current measured power", sensorWaiting: "Waiting for the next sensor sample", sensorSource: "Source", sensorMethod: "Measurement", sensorSessionEnergy: "Energy observed since the app started", sensorTotalTitle: "Whole PC total", sensorTotalBody: "Sensor channels may overlap, so each is shown separately. A wall outlet power meter is needed to measure the full PC input.", sensorInventoryHeading: "Detected computer devices", sensorInventoryScope: "This PC · rescans every 15 sec", sensorMeasured: "Live watts available", sensorNoLivePower: "No live watt sensor", sensorNeedsUsbMeter: "Requires an inline USB meter", sensorCoverage: "Sensor channels: {channels}", sensorNoDevices: "No devices were returned by Windows hardware inventory.", sensorNoReadings: "No live sensor readings are available yet.", sensorLabelPackage: "CPU package", sensorLabelCores: "CPU cores", sensorLabelDram: "Memory domain (DRAM)", sensorLabelGraphicsDomain: "Graphics domain (PP1)", sensorLabelGpu: "Graphics card", sensorLabelOther: "Energy channel", sensorKindProcessor: "Processor", sensorKindGraphics: "Graphics", sensorKindMemory: "Memory", sensorKindStorage: "Storage", sensorKindKeyboard: "Keyboard", sensorKindMouse: "Mouse / pointing device", sensorKindMonitor: "Monitor", sensorKindUsb: "USB device", sensorKindUsbHub: "USB hub", sensorKindUsbController: "USB controller", sensorKindBattery: "Battery", sensorKindMotherboard: "Motherboard", sensorKindCooling: "Fans / cooling", sensorKindPowerSupply: "Power supply", sensorKindOther: "Device",
    latestLoggedPower: "LATEST LOGGED POWER", noReadings: "No readings yet", manualEntry: "MANUALLY RECORDED", estimatedEnergy: "ESTIMATED ENERGY", needTwoReadings: "Add two close readings to calculate energy", calculatedFromReadings: "CALCULATED FROM READINGS", loggedReadings: "LOGGED READINGS", entries: "entries", metersConfigured: "{count} meters tracked", savedOnDevice: "SAVED ON THIS DEVICE",
    powerTrend: "POWER TREND", readingsOverTime: "Readings over time", chartEmptyTitle: "Your trend starts with a reading", chartEmptyBody: "Record two readings to see a power trend.", loggedPower: "Logged power", wattsOverSelectedPeriod: "Watts · selected period",
    addToNotebook: "ADD TO NOTEBOOK", logReading: "Log a reading", formIntro: "Enter a value shown by your external power meter.", meterOrDevice: "Meter or device", powerReading: "Power reading", noteOptional: "Note", optional: "OPTIONAL", saveReading: "Save reading", savedLocally: "Saved locally · No account needed",
    measurementHistory: "MEASUREMENT HISTORY", recentReadings: "Recent readings", mostRecentFirst: "Most recent first", dateTime: "DATE & TIME", meter: "METER", power: "POWER", source: "SOURCE", note: "NOTE", actions: "Actions", historyEmptyTitle: "No readings in this period", historyEmptyBody: "Add a reading from your meter to start your local history.", showingLatest: "Showing the latest readings in this period", footerLeft: "POWER MONITOR LAB · PRIVATE BY DESIGN", footerRight: "Energy uses readings from this app session; gaps over 30 minutes are excluded.",
    enterMeter: "Enter a meter or device name.", invalidWatts: "Enter a power value from 0 to 100,000 W.", saveFailed: "Could not save the reading.", saved: "Reading saved on this device.", confirmDelete: "Delete this reading from your local history?", deleteFailed: "Could not delete the reading.", deleted: "Reading deleted.", exportFailed: "CSV export could not be created.", exportEmpty: "There are no readings to export in this period.",
    noReadingsPeriod: "No readings in this period", latestAt: "Logged {time}", noEnergy: "Add two readings less than 30 minutes apart in this app session to estimate energy.", energyDetail: "{minutes} min covered · {gaps} long gaps omitted", energyDetailNoGaps: "{minutes} min between readings", readingsCaption: "{count} readings in this period", meterCount: "{count} meters tracked", showingCount: "Showing {count} recent readings · newest first", refreshed: "Updated {time}", deleteLabel: "Delete reading", meterRequired: "Unnamed meter", none: "—", meterPlaceholder: "e.g. Desk plug meter", notePlaceholder: "e.g. Idle, display on", clearHistory: "Clear history", confirmClear: "Permanently clear all readings saved on this device? Export a CSV first if you need a backup.", historyCleared: "Local reading history cleared.", clearFailed: "Could not clear the local history."
  },
  vi: {
    sensorSharedPowerPath: "Cùng nhóm thiết bị USB của Windows với: {devices}; chỉ cần đo một nhánh nguồn.",
    workspace: "KHÔNG GIAN LÀM VIỆC", workspaceShort: "Không gian", overview: "Tổng quan", readingLog: "Nhật ký đo",
    privateTitle: "Dữ liệu ở trên máy này", privateBody: "Lưu trên PC này, không gửi lên dịch vụ đám mây.", localHost: "Máy chủ cục bộ đang chạy", onThisDevice: "Trên thiết bị này",
    measurementNotebook: "SỔ THEO DÕI SỐ ĐO", title: "Công suất, có ngữ cảnh.", subtitle: "Sổ ghi cục bộ cho số đo công suất và năng lượng ước tính.",
    filterMeter: "Lọc theo đồng hồ", allMeters: "Tất cả đồng hồ", timeRange: "Khoảng thời gian", last24Hours: "24 giờ qua", last7Days: "7 ngày qua", last30Days: "30 ngày qua", exportCsv: "Xuất CSV",
    manualOnlyTitle: "Chỉ ghi số đo thủ công.", manualOnlyBody: "Phiên bản này chưa tích hợp cảm biến tự động. Hãy nhập số từ đồng hồ ngoài; ứng dụng không tự tạo số watt trực tiếp.", honestData: "SỐ LIỆU RÕ NGUỒN",
    sensorNoticeTitle: "Đã bật tự nhận diện phần cứng.", sensorNoticeBody: "Chỉ hiện số đo khi cảm biến cục bộ cung cấp watt thật; số đo nhập tay vẫn tách riêng.", sensorNoticeTag: "TRẠNG THÁI PHẦN CỨNG",
    sensorEyebrow: "TỰ NHẬN DIỆN PHẦN CỨNG", sensorHeading: "Cảm biến và thiết bị đã nhận diện", sensorStatusStarting: "Đang dò", sensorStatusAvailable: "Đang đo", sensorStatusPartial: "Một phần", sensorStatusUnavailable: "Chưa có số đo", sensorStatusUnsupported: "Chỉ hỗ trợ Windows",
    sensorIntro: "Đang tìm các nguồn đo công suất mà máy tính cung cấp.", sensorLhmHint: "Có thể bật LibreHardwareMonitor và Remote Web Server cổng 8085 để bổ sung các kênh công suất trực tiếp mà phần cứng cung cấp.", sensorProviderConnected: "đã kết nối", sensorProviderUnavailable: "chưa kết nối", sensorAvailableMessage: "Đang nhận số đo trực tiếp từ các kênh phần cứng có trên PC này.", sensorPartialMessage: "Đã nhận diện thiết bị, nhưng Windows không cung cấp số watt trực tiếp cho chúng.", sensorUnavailableMessage: "Không tìm thấy cảm biến công suất trực tiếp được hỗ trợ trên PC này.", sensorUnsupportedMessage: "Hiện chỉ hỗ trợ tự động đọc cảm biến phần cứng trên Windows.", sensorReadingsHeading: "Công suất đo được hiện tại", sensorWaiting: "Đang chờ mẫu cảm biến tiếp theo", sensorSource: "Nguồn đo", sensorMethod: "Cách đo", sensorSessionEnergy: "Năng lượng ghi nhận từ lúc mở ứng dụng", sensorTotalTitle: "Tổng công suất cả máy", sensorTotalBody: "Các kênh có thể chồng lấp nên được hiển thị riêng. Cần đồng hồ đo điện ở ổ cắm để đo điện đầu vào của toàn PC.", sensorInventoryHeading: "Thiết bị trên máy tính đã nhận diện", sensorInventoryScope: "Chỉ máy này · dò lại mỗi 15 giây", sensorMeasured: "Có số watt trực tiếp", sensorNoLivePower: "Không có cảm biến watt trực tiếp", sensorNeedsUsbMeter: "Cần đồng hồ USB nối tiếp", sensorCoverage: "Kênh cảm biến: {channels}", sensorNoDevices: "Windows chưa trả về danh sách thiết bị phần cứng.", sensorNoReadings: "Chưa có số đo cảm biến trực tiếp.", sensorLabelPackage: "CPU package", sensorLabelCores: "Lõi CPU", sensorLabelDram: "Miền bộ nhớ (DRAM)", sensorLabelGraphicsDomain: "Miền đồ họa (PP1)", sensorLabelGpu: "Card đồ họa", sensorLabelOther: "Kênh năng lượng", sensorKindProcessor: "Bộ xử lý", sensorKindGraphics: "Đồ họa", sensorKindMemory: "Bộ nhớ", sensorKindStorage: "Ổ lưu trữ", sensorKindKeyboard: "Bàn phím", sensorKindMouse: "Chuột / thiết bị trỏ", sensorKindMonitor: "Màn hình", sensorKindUsb: "Thiết bị USB", sensorKindUsbHub: "Hub USB", sensorKindUsbController: "Bộ điều khiển USB", sensorKindBattery: "Pin", sensorKindMotherboard: "Bo mạch chủ", sensorKindCooling: "Quạt / tản nhiệt", sensorKindPowerSupply: "Bộ nguồn", sensorKindOther: "Thiết bị",
    latestLoggedPower: "SỐ ĐO CÔNG SUẤT MỚI NHẤT", noReadings: "Chưa có số đo", manualEntry: "GHI NHẬN THỦ CÔNG", estimatedEnergy: "NĂNG LƯỢNG ƯỚC TÍNH", needTwoReadings: "Cần hai số đo gần nhau để tính năng lượng", calculatedFromReadings: "TÍNH TỪ CÁC SỐ ĐO", loggedReadings: "SỐ ĐO ĐÃ GHI", entries: "lần", metersConfigured: "Đang theo dõi {count} đồng hồ", savedOnDevice: "LƯU TRÊN THIẾT BỊ NÀY",
    powerTrend: "XU HƯỚNG CÔNG SUẤT", readingsOverTime: "Số đo theo thời gian", chartEmptyTitle: "Bắt đầu biểu đồ bằng một số đo", chartEmptyBody: "Ghi hai số đo để xem xu hướng công suất.", loggedPower: "Công suất đã ghi", wattsOverSelectedPeriod: "Watt · khoảng đã chọn",
    addToNotebook: "THÊM VÀO SỔ ĐO", logReading: "Ghi số đo", formIntro: "Nhập số hiển thị trên đồng hồ công suất ngoài.", meterOrDevice: "Đồng hồ hoặc thiết bị", powerReading: "Số đo công suất", noteOptional: "Ghi chú", optional: "KHÔNG BẮT BUỘC", saveReading: "Lưu số đo", savedLocally: "Lưu cục bộ · Không cần tài khoản",
    measurementHistory: "LỊCH SỬ ĐO", recentReadings: "Số đo gần đây", mostRecentFirst: "Mới nhất trước", dateTime: "NGÀY & GIỜ", meter: "ĐỒNG HỒ", power: "CÔNG SUẤT", source: "NGUỒN", note: "GHI CHÚ", actions: "Thao tác", historyEmptyTitle: "Chưa có số đo trong khoảng này", historyEmptyBody: "Thêm số đo từ đồng hồ để bắt đầu lịch sử cục bộ.", showingLatest: "Hiển thị số đo gần đây trong khoảng này", footerLeft: "POWER MONITOR LAB · RIÊNG TƯ THEO THIẾT KẾ", footerRight: "Năng lượng chỉ tính trong lần chạy này; khoảng trống trên 30 phút bị loại.",
    enterMeter: "Nhập tên đồng hồ hoặc thiết bị.", invalidWatts: "Nhập công suất từ 0 đến 100.000 W.", saveFailed: "Không lưu được số đo.", saved: "Đã lưu số đo trên thiết bị này.", confirmDelete: "Xóa số đo này khỏi lịch sử cục bộ?", deleteFailed: "Không xóa được số đo.", deleted: "Đã xóa số đo.", exportFailed: "Không tạo được tệp CSV.", exportEmpty: "Không có số đo nào trong khoảng này để xuất.",
    noReadingsPeriod: "Chưa có số đo trong khoảng này", latestAt: "Ghi lúc {time}", noEnergy: "Ghi hai số đo trong cùng lần chạy, cách nhau dưới 30 phút để ước tính năng lượng.", energyDetail: "Đã tính {minutes} phút · bỏ qua {gaps} khoảng trống dài", energyDetailNoGaps: "{minutes} phút giữa các số đo", readingsCaption: "{count} số đo trong khoảng này", meterCount: "Đang theo dõi {count} đồng hồ", showingCount: "Hiển thị {count} số đo gần nhất · mới nhất trước", refreshed: "Cập nhật {time}", deleteLabel: "Xóa số đo", meterRequired: "Đồng hồ chưa đặt tên", none: "—", meterPlaceholder: "VD: Ổ cắm đo công suất bàn làm việc", notePlaceholder: "VD: Chờ, màn hình bật", clearHistory: "Xóa lịch sử", confirmClear: "Xóa vĩnh viễn toàn bộ số đo lưu trên thiết bị này? Hãy xuất CSV trước nếu cần bản sao lưu.", historyCleared: "Đã xóa lịch sử số đo cục bộ.", clearFailed: "Không xóa được lịch sử cục bộ."
  }
};

Object.assign(translations.en, {
  documentTitle: "Power Monitor · Computer power",
  skipToContent: "Skip to content",
  localApp: "LOCAL MONITOR",
  mainNavigation: "Main navigation",
  deviceNav: "Devices",
  autoRefresh: "Auto-updating every 3 seconds",
  sensorUpdatedAt: "Updated at {time} · automatic",
  language: "Language",
  chartAndEntry: "Chart and manual entry",
  manualNav: "Manual entry",
  technicalSources: "Sensor sources and details",
  estimateDetails: "Estimate details · not measured",
  measurementGuide: "How to measure",
  deviceCount: "{count} detected devices",
  loggedDataSummary: "Manual-entry summary",
  measurementNotebook: "THIS COMPUTER",
  title: "Computer power",
  subtitle: "Automatically updated readings from the sensors available on this PC.",
  sensorEyebrow: "LIVE SENSOR READINGS",
  sensorHeading: "Power being measured",
  sensorIntro: "Looking for power sensors on this computer.",
  sensorLhmHint: "LibreHardwareMonitor can add any additional live power channels this PC exposes.",
  sensorAvailableMessage: "Live readings are coming from sensors in this PC.",
  sensorPartialMessage: "Some devices were found, but they do not expose live watt readings.",
  sensorUnavailableMessage: "No supported live power sensor was found on this PC.",
  sensorReadingsHeading: "Measured power",
  sensorTotalBody: "Internal sensors cover only some components and can overlap. Use an AC outlet meter to measure power drawn by the whole PC.",
  sensorInventoryHeading: "Detected devices",
  sensorInventoryScope: "Scanned again every 15 seconds",
  sensorMeasured: "Live sensor reading",
  sensorNoLivePower: "No live watt reading",
  sensorNeedsUsbMeter: "Needs a separate meter",
  sensorNoReadings: "No live sensor readings are available.",
  powerTrend: "READING HISTORY",
  readingsOverTime: "Power readings over time",
  chartEmptyTitle: "The chart appears after you add readings",
  chartEmptyBody: "Add two readings to see a trend.",
  loggedPower: "Logged readings",
  wattsOverSelectedPeriod: "Watts · selected period",
  manualEntry: "READ FROM AN EXTERNAL METER",
  logReading: "Add a manual reading",
  formIntro: "Enter a value from a real meter. Do not enter an estimate.",
  meterOrDevice: "Meter or device",
  powerReading: "Measured power",
  noteOptional: "Note",
  optional: "Optional",
  saveReading: "Save reading",
  savedLocally: "Saved on this PC · No account needed",
  measurementHistory: "MANUAL READING HISTORY",
  recentReadings: "Saved readings",
  dateTime: "Date and time",
  meter: "Meter",
  power: "Power",
  source: "Source",
  note: "Note",
  actions: "Actions",
  historyEmptyTitle: "No readings in this period",
  historyEmptyBody: "Enter a value from a meter to start your history.",
  showingLatest: "Showing the newest readings in this period",
  latestLoggedPower: "LATEST MANUAL READING",
  estimatedEnergy: "ESTIMATED ENERGY",
  loggedReadings: "READINGS SAVED",
  entries: "readings",
  metersConfigured: "{count} meters",
  noReadings: "No readings yet",
  needTwoReadings: "Add two readings close together to estimate energy",
  footerRight: "Energy is estimated from manual readings; gaps over 30 minutes are excluded.",
  footerLeft: "POWER MONITOR LAB · STORED LOCALLY",
  localHost: "Running on this PC",
  privateTitle: "Saved on this PC",
  privateBody: "Your data stays on this computer.",
  overview: "Live power",
  readingLog: "History",
  sensorTotalTitle: "Whole-PC input power is not measured",
  meterPlaceholder: "e.g. outlet power meter",
  notePlaceholder: "e.g. idle, monitor on",
  clearHistory: "Clear history",
  filterMeter: "Filter by meter",
  timeRange: "Time range",
  allMeters: "All meters",
  last24Hours: "Last 24 hours",
  last7Days: "Last 7 days",
  last30Days: "Last 30 days",
  exportCsv: "Export CSV",
  decimalWattHint: "Use a period or comma for decimal values."
});

Object.assign(translations.vi, {
  documentTitle: "Power Monitor · Công suất máy tính",
  skipToContent: "Bỏ qua điều hướng",
  localApp: "THEO DÕI CỤC BỘ",
  mainNavigation: "Điều hướng chính",
  deviceNav: "Thiết bị",
  autoRefresh: "Tự cập nhật mỗi 3 giây",
  sensorUpdatedAt: "Cập nhật lúc {time} · tự động",
  language: "Ngôn ngữ",
  chartAndEntry: "Biểu đồ và nhập số đo",
  manualNav: "Ghi thủ công",
  technicalSources: "Nguồn cảm biến và chi tiết",
  estimateDetails: "Chi tiết ước tính · không phải số đo",
  measurementGuide: "Cách đo",
  deviceCount: "{count} thiết bị được nhận diện",
  loggedDataSummary: "Tóm tắt số liệu nhập tay",
  measurementNotebook: "MÁY TÍNH NÀY",
  title: "Công suất máy tính",
  subtitle: "Tự động cập nhật số đo từ các cảm biến có trên PC này.",
  sensorEyebrow: "SỐ ĐO CẢM BIẾN",
  sensorHeading: "Công suất đang đo",
  sensorIntro: "Đang tìm cảm biến công suất trên máy tính này.",
  sensorLhmHint: "LibreHardwareMonitor có thể bổ sung các kênh đo trực tiếp mà PC này hỗ trợ.",
  sensorAvailableMessage: "Đang nhận số đo trực tiếp từ cảm biến của máy tính.",
  sensorPartialMessage: "Đã nhận diện một số thiết bị, nhưng chúng không cung cấp số watt trực tiếp.",
  sensorUnavailableMessage: "Chưa tìm thấy cảm biến công suất trực tiếp được hỗ trợ trên PC này.",
  sensorReadingsHeading: "Công suất đo trực tiếp",
  sensorTotalTitle: "Chưa đo được điện đầu vào của cả máy",
  sensorTotalBody: "Cảm biến bên trong chỉ đo một số phần và có thể chồng lấp. Muốn biết PC lấy bao nhiêu điện từ ổ cắm, cần đồng hồ đo AC.",
  sensorInventoryHeading: "Thiết bị được nhận diện",
  sensorInventoryScope: "Tự quét lại mỗi 15 giây",
  sensorMeasured: "Có số đo trực tiếp",
  sensorNoLivePower: "Chưa có số đo watt",
  sensorNeedsUsbMeter: "Cần đồng hồ đo riêng",
  sensorNoReadings: "Chưa có số đo cảm biến trực tiếp.",
  powerTrend: "LỊCH SỬ SỐ ĐO",
  readingsOverTime: "Công suất theo thời gian",
  chartEmptyTitle: "Biểu đồ sẽ hiện sau khi có số đo",
  chartEmptyBody: "Ghi hai lần đo để xem xu hướng.",
  loggedPower: "Số đã ghi",
  wattsOverSelectedPeriod: "Watt · khoảng thời gian đã chọn",
  manualEntry: "NHẬP TỪ ĐỒNG HỒ NGOÀI",
  logReading: "Ghi số đo thủ công",
  formIntro: "Chỉ nhập số đọc từ đồng hồ thật. Không nhập ước tính.",
  meterOrDevice: "Đồng hồ hoặc thiết bị",
  powerReading: "Công suất đọc được",
  noteOptional: "Ghi chú",
  optional: "Không bắt buộc",
  saveReading: "Lưu số đo",
  savedLocally: "Lưu trên PC này · Không cần tài khoản",
  measurementHistory: "LỊCH SỬ NHẬP TAY",
  recentReadings: "Các số đo đã ghi",
  dateTime: "Thời gian",
  meter: "Đồng hồ",
  power: "Công suất",
  source: "Nguồn",
  note: "Ghi chú",
  actions: "Thao tác",
  historyEmptyTitle: "Chưa có số đo trong khoảng này",
  historyEmptyBody: "Nhập số từ đồng hồ để bắt đầu lưu lịch sử.",
  showingLatest: "Hiện các số đo mới nhất trong khoảng này",
  latestLoggedPower: "SỐ GHI TAY GẦN NHẤT",
  estimatedEnergy: "NĂNG LƯỢNG ƯỚC TÍNH",
  loggedReadings: "SỐ LẦN ĐÃ GHI",
  entries: "lần",
  metersConfigured: "{count} đồng hồ",
  noReadings: "Chưa có số đo",
  needTwoReadings: "Ghi hai lần gần nhau để ước tính năng lượng",
  footerRight: "Năng lượng được ước tính từ các số nhập tay; khoảng cách trên 30 phút được bỏ qua.",
  footerLeft: "POWER MONITOR LAB · LƯU CỤC BỘ",
  localHost: "Đang chạy trên máy này",
  privateTitle: "Lưu trên máy này",
  privateBody: "Dữ liệu chỉ được lưu cục bộ trên máy tính.",
  overview: "Đang đo",
  readingLog: "Lịch sử",
  meterPlaceholder: "Ví dụ: đồng hồ ổ cắm",
  notePlaceholder: "Ví dụ: máy nghỉ, màn hình bật",
  clearHistory: "Xóa lịch sử",
  filterMeter: "Lọc theo đồng hồ",
  timeRange: "Khoảng thời gian",
  allMeters: "Tất cả đồng hồ",
  last24Hours: "24 giờ qua",
  last7Days: "7 ngày qua",
  last30Days: "30 ngày qua",
  exportCsv: "Xuất CSV",
  decimalWattHint: "Dùng dấu phẩy hoặc dấu chấm cho số thập phân."
});

const chartColors = ["#258b65", "#e39b44", "#7187b7", "#cf6f73", "#8768a8", "#3d9aa2"];
const additionalKindLabels = {
  en: { network: "Network adapter", audio: "Audio device" },
  vi: { network: "Card mạng", audio: "Thiết bị âm thanh" }
};
const sharedMeasurementLabels = {
  en: { memory: "Shared DRAM channel" },
  vi: { memory: "Kênh DRAM dùng chung" }
};
const sensorReadingNotes = {
  en: {
    powerLimit: "GPU power limit (cap, not current draw)",
    sharedDram: "Shared memory-domain reading; not per-DIMM power.",
    unusedPp1: "This F-series CPU has no integrated graphics; PP1 does not measure the NVIDIA card."
  },
  vi: {
    powerLimit: "Giới hạn công suất GPU (mức trần, không phải mức đang dùng)",
    sharedDram: "Số đo miền bộ nhớ dùng chung, không phải watt riêng từng thanh RAM.",
    unusedPp1: "CPU dòng F này không có đồ họa tích hợp; PP1 không đo card NVIDIA."
  }
};
const sensorMethodLabels = {
  vi: {
    "Average from the cumulative energy counter between samples": "Tính trung bình từ năng lượng tích lũy giữa hai lần lấy mẫu.",
    "Last measured GPU board power draw": "Công suất bo mạch GPU ở lần đo gần nhất.",
    "Latest hardware power sensor value (watts)": "Giá trị watt mới nhất từ cảm biến phần cứng."
  }
};
const deviceMeasurementGuides = {
  en: {
    processor: "CPU package and PP0 domains are measured; individual core watts are not exposed.",
    graphics: "A supported GPU driver can report board watts; that does not equal wall input.",
    memory: "DRAM watts are a shared domain; Windows cannot split them by DIMM.",
    storageSata: "Per-drive watts need an inline DC meter on this SATA drive's power lead; Windows reports no live watts here.",
    storage: "Per-drive watts need actual drive telemetry or an inline DC power meter.",
    monitor: "Use a true-watt AC outlet meter on each monitor; DDC/CI does not report live watts.",
    usbPeripheral: "Use one data-pass-through USB meter per power path. Composite devices share a reading; wireless peripherals use their own batteries.",
    usbDevice: "An inline USB meter reads this device's power branch. USB bMaxPower is only a declared maximum, not live current.",
    usbHub: "This PC exposes no live current per hub port; meter the specific downstream power branch.",
    usbController: "Windows exposes no host-controller watts; use a whole-PC AC meter or instrumented DC rails.",
    motherboard: "This board reports voltage and fan RPM, not current or watts. Use a wall meter for whole-PC input.",
    cooling: "Fan RPM is not watts. A current meter on the fan power lead is needed.",
    network: "No adapter-specific watt sensor is exposed; measure the system DC rail or whole-PC AC input.",
    audio: "No audio-chip watt sensor is exposed; its power is part of the host board or GPU rail.",
    powerSupply: "A wall meter measures whole-PC AC input; PSU rail telemetry needs a supported digital PSU."
  },
  vi: {
    processor: "Đang đo miền CPU package và PP0; Windows không cung cấp watt riêng từng lõi.",
    graphics: "Driver GPU tương thích có thể báo watt toàn card; số này không phải điện đầu vào ổ cắm.",
    memory: "Watt DRAM là miền bộ nhớ dùng chung; Windows không tách được từng thanh RAM.",
    storageSata: "Muốn đo riêng ổ SATA cần đồng hồ DC nối tiếp trên dây nguồn của ổ; Windows hiện không báo watt trực tiếp.",
    storage: "Muốn đo riêng ổ cần telemetry công suất thật từ firmware hoặc đồng hồ DC nối tiếp.",
    monitor: "Dùng đồng hồ đo watt AC ở ổ cắm cho từng màn hình; DDC/CI không báo watt trực tiếp.",
    usbPeripheral: "Dùng một đồng hồ USB có truyền dữ liệu cho mỗi nhánh nguồn. Thiết bị ghép chung sẽ có số đo gộp; thiết bị không dây dùng pin riêng.",
    usbDevice: "Đồng hồ USB nối tiếp đo nhánh nguồn này. USB bMaxPower chỉ là dòng tối đa khai báo, không phải dòng đang dùng.",
    usbHub: "PC này không báo dòng trực tiếp từng cổng hub; cần đo riêng nhánh USB phía sau.",
    usbController: "Windows không báo watt bộ điều khiển USB; cần đồng hồ AC toàn máy hoặc đo các đường nguồn DC.",
    motherboard: "Bo mạch này báo điện áp và tốc độ quạt, không báo dòng hay watt. Dùng đồng hồ ổ cắm để đo cả PC.",
    cooling: "RPM quạt không cho biết watt; cần đo dòng trên dây cấp nguồn quạt.",
    network: "Không có cảm biến watt riêng cho card mạng; chỉ đo được qua đường nguồn DC hoặc điện AC của cả máy.",
    audio: "Không có cảm biến watt riêng cho chip âm thanh; công suất nằm trong đường nguồn bo mạch hoặc GPU.",
    powerSupply: "Đồng hồ ổ cắm đo điện AC cả PC; đo từng đường PSU cần bộ nguồn số có telemetry tương thích."
  }
};
function getSavedLanguage() {
  try {
    const saved = localStorage.getItem("power-monitor-lab.language");
    return saved === "en" || saved === "vi" ? saved : "vi";
  } catch {
    return "vi";
  }
}
const state = { language: getSavedLanguage(), sensors: null };
const $ = (selector) => document.querySelector(selector);

function tr(key, values = {}) {
  let value = translations[state.language][key] ?? translations.en[key] ?? key;
  for (const [name, replacement] of Object.entries(values)) value = value.replaceAll(`{${name}}`, String(replacement));
  return value;
}

function applyLanguage() {
  document.documentElement.lang = state.language;
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = tr(element.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => { element.placeholder = tr(element.dataset.i18nPlaceholder); });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    element.setAttribute("aria-label", tr(element.dataset.i18nAriaLabel));
  });
  document.querySelectorAll("[data-language]").forEach((button) => {
    const active = button.dataset.language === state.language;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  renderSensors();
}

async function requestJson(path, options = {}) {
  const response = await fetch(path, { headers: { "Content-Type": "application/json", ...(options.headers ?? {}) }, ...options });
  if (response.status === 204) return null;
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const validation = body.errors ? Object.values(body.errors).flat().join(" ") : "";
    throw new Error(validation || body.detail || body.title || `HTTP ${response.status}`);
  }
  return body;
}

async function refreshSensors() {
  try {
    state.sensors = await requestJson("/api/sensors");
    renderSensors();
  } catch {
    state.sensors = { status: "unavailable", providers: [], readings: [], devices: [], message: "" };
    renderSensors();
  }
  const caption = $("#refresh-caption");
  if (caption) {
    const sampledAt = Date.parse(state.sensors.sampledAtUtc ?? "");
    caption.textContent = Number.isFinite(sampledAt)
      ? tr("sensorUpdatedAt", { time: formatTime(new Date(sampledAt)) })
      : tr("autoRefresh");
  }
}

function sensorLabel(reading) {
  const name = String(reading.name ?? "");
  if (name === "RAPL_Package0_PKG") return tr("sensorLabelPackage");
  if (name === "RAPL_Package0_PP0") return tr("sensorLabelCores");
  if (name === "RAPL_Package0_DRAM") return tr("sensorLabelDram");
  if (name === "RAPL_Package0_PP1") return tr("sensorLabelGraphicsDomain");
  if (reading.source === "NVIDIA nvidia-smi") return tr("sensorLabelGpu");
  return name || tr("sensorLabelOther");
}

function deviceMeasurementGuide(device) {
  const keys = {
    processor: "processor", graphics: "graphics", memory: "memory",
    storage: device.busType === "SATA" ? "storageSata" : "storage",
    monitor: "monitor", keyboard: "usbPeripheral", mouse: "usbPeripheral",
    usb: "usbDevice", "usb-hub": "usbHub", "usb-controller": "usbController",
    motherboard: "motherboard", cooling: "cooling", network: "network",
    audio: "audio", "power-supply": "powerSupply"
  };
  return deviceMeasurementGuides[state.language]?.[keys[device.kind]] ?? "";
}

const powerEstimateLabels = {
  en: {
    disclosure: "Estimates are separate from live sensor readings and are never added to measured watts or whole-PC totals.",
    measuredTag: "MEASURED", allocatedTag: "ALLOCATED ESTIMATE", modelledTag: "ACTIVITY MODEL",
    rangeTag: "ESTIMATE RANGE", boundTag: "SPEC LIMIT", adapterTag: "ADAPTER RATING", includedTag: "INCLUDED ELSEWHERE", unavailableTag: "NO ESTIMATE",
    measuredValue: "Direct sensor value shown above",
    allocatedValue: "~{watts} W allocated from shared sensor",
    modelledValue: "~{watts} W model estimate · profile {low}–{high} W",
    rangeValue: "Model range {low}–{high} W",
    rangeTypicalValue: "Model range {low}–{high} W · reference {typical} W",
    boundValue: "Manufacturer maximum {watts} W · not current draw",
    adapterValue: "Family adapter output rating {low}–{high} W · not monitor draw",
    includedValue: "Included in {device}", unavailableValue: "No defensible estimate basis",
    confidenceLow: "low confidence", confidenceMedium: "medium confidence", confidenceVeryLow: "very low confidence",
    sourceLabel: "Source"
  },
  vi: {
    disclosure: "Ước tính được tách khỏi số đo cảm biến trực tiếp và không bao giờ cộng vào watt đo được hay tổng công suất PC.",
    measuredTag: "ĐO TRỰC TIẾP", allocatedTag: "ƯỚC TÍNH PHÂN BỔ", modelledTag: "MÔ HÌNH HOẠT ĐỘNG",
    rangeTag: "KHOẢNG ƯỚC TÍNH", boundTag: "GIỚI HẠN TÀI LIỆU", adapterTag: "CÔNG SUẤT ADAPTER", includedTag: "ĐÃ TÍNH Ở MỤC KHÁC", unavailableTag: "CHƯA ƯỚC TÍNH",
    measuredValue: "Số đo cảm biến trực tiếp ở phía trên",
    allocatedValue: "~{watts} W phân bổ từ cảm biến dùng chung",
    modelledValue: "~{watts} W mô hình · khoảng hồ sơ {low}–{high} W",
    rangeValue: "Khoảng mô hình {low}–{high} W",
    rangeTypicalValue: "Khoảng mô hình {low}–{high} W · mốc tham khảo {typical} W",
    boundValue: "Công suất tối đa {watts} W theo tài liệu · không phải số đang dùng",
    adapterValue: "Công suất đầu ra adapter của họ mẫu {low}–{high} W · không phải điện tiêu thụ của màn hình",
    includedValue: "Đã gộp trong ước tính {device}", unavailableValue: "Chưa có cơ sở ước tính đáng tin",
    confidenceLow: "độ tin cậy thấp", confidenceMedium: "độ tin cậy trung bình", confidenceVeryLow: "độ tin cậy rất thấp",
    sourceLabel: "Nguồn"
  }
};

function formatEstimateWatts(value) {
  if (!Number.isFinite(value)) return "—";
  if (value === 0) return "0";
  return value < 1 ? value.toFixed(2) : value.toFixed(1);
}

function renderPowerEstimate(device, language) {
  const estimate = device.powerEstimate;
  if (!estimate) return null;
  const labels = powerEstimateLabels[language] ?? powerEstimateLabels.en;
  const container = document.createElement("div");
  container.className = `device-estimate estimate-${estimate.status ?? "unavailable"}`;
  const methodText = language === "vi" ? (estimate.methodVi ?? estimate.method) : estimate.method;
  container.title = methodText ?? "";

  const tag = document.createElement("strong");
  const tagKey = {
    measured: "measuredTag", allocated: "allocatedTag", modelled: "modelledTag",
    range: "rangeTag", "upper-bound": "boundTag", "adapter-rating": "adapterTag", included: "includedTag", unavailable: "unavailableTag"
  }[estimate.status] ?? "unavailableTag";
  tag.textContent = labels[tagKey];

  const interpolate = (key, values = {}) => Object.entries(values).reduce(
    (text, [name, replacement]) => text.replaceAll(`{${name}}`, String(replacement)), labels[key]
  );
  const value = document.createElement("span");
  if (estimate.status === "measured") {
    value.textContent = labels.measuredValue;
  } else if (estimate.status === "allocated") {
    value.textContent = interpolate("allocatedValue", { watts: formatEstimateWatts(estimate.estimatedWatts) });
  } else if (estimate.status === "modelled") {
    value.textContent = interpolate("modelledValue", {
      watts: formatEstimateWatts(estimate.estimatedWatts), low: formatEstimateWatts(estimate.lowWatts), high: formatEstimateWatts(estimate.highWatts)
    });
  } else if (estimate.status === "range") {
    const key = Number.isFinite(estimate.typicalWatts) ? "rangeTypicalValue" : "rangeValue";
    value.textContent = interpolate(key, {
      low: formatEstimateWatts(estimate.lowWatts), high: formatEstimateWatts(estimate.highWatts), typical: formatEstimateWatts(estimate.typicalWatts)
    });
  } else if (estimate.status === "upper-bound") {
    value.textContent = interpolate("boundValue", { watts: formatEstimateWatts(estimate.highWatts) });
  } else if (estimate.status === "adapter-rating") {
    value.textContent = interpolate("adapterValue", {
      low: formatEstimateWatts(estimate.lowWatts), high: formatEstimateWatts(estimate.highWatts)
    });
  } else if (estimate.status === "included") {
    value.textContent = interpolate("includedValue", { device: estimate.parentName ?? "related device" });
  } else {
    value.textContent = labels.unavailableValue;
  }

  container.append(tag, value);
  if (methodText && estimate.status !== "measured") {
    const method = document.createElement("small");
    method.className = "device-estimate-method";
    method.textContent = methodText;
    container.append(method);
  }
  const confidenceKey = { low: "confidenceLow", medium: "confidenceMedium", "very-low": "confidenceVeryLow" }[estimate.confidence];
  if (confidenceKey) {
    const confidence = document.createElement("small");
    confidence.textContent = labels[confidenceKey];
    container.append(confidence);
  }
  if (Array.isArray(estimate.sources) && estimate.sources.length > 0) {
    const sources = document.createElement("span");
    sources.className = "device-estimate-sources";
    estimate.sources.forEach((source, index) => {
      if (index > 0) sources.append(document.createTextNode(" · "));
      const link = document.createElement("a");
      link.href = source.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = `${labels.sourceLabel}: ${source.label}`;
      sources.append(link);
    });
    container.append(sources);
  }
  return container;
}

function renderSensors() {
  const snapshot = state.sensors;
  if (!snapshot) return;
  const status = $("#sensor-status");
  const statusKey = {
    starting: "sensorStatusStarting",
    available: "sensorStatusAvailable",
    partial: "sensorStatusPartial",
    unavailable: "sensorStatusUnavailable",
    unsupported: "sensorStatusUnsupported"
  }[snapshot.status] ?? "sensorStatusUnavailable";
  status.dataset.state = snapshot.status;
  status.textContent = tr(statusKey);
  const estimateNote = $("#sensor-estimate-note");
  if (estimateNote) estimateNote.textContent = (powerEstimateLabels[state.language] ?? powerEstimateLabels.en).disclosure;
  const messageKey = {
    starting: "sensorIntro",
    available: "sensorAvailableMessage",
    partial: "sensorPartialMessage",
    unavailable: "sensorUnavailableMessage",
    unsupported: "sensorUnsupportedMessage"
  }[snapshot.status] ?? "sensorUnavailableMessage";
  $("#sensor-description").textContent = tr(messageKey);

  const providerList = $("#sensor-provider-list");
  providerList.replaceChildren();
  for (const provider of Array.isArray(snapshot.providers) ? snapshot.providers : []) {
    const chip = document.createElement("span");
    chip.className = "sensor-provider-chip";
    chip.dataset.state = provider.available ? "connected" : "unavailable";
    const name = document.createElement("span");
    name.textContent = provider.name ?? provider.id ?? tr("sensorKindOther");
    const stateLabel = document.createElement("strong");
    stateLabel.textContent = provider.available ? tr("sensorProviderConnected") : tr("sensorProviderUnavailable");
    chip.append(name, stateLabel);
    providerList.append(chip);
  }

  const readingGrid = $("#sensor-reading-grid");
  readingGrid.replaceChildren();
  const readings = Array.isArray(snapshot.readings) ? snapshot.readings : [];
  const hasIntelFSeriesCpu = (Array.isArray(snapshot.devices) ? snapshot.devices : []).some((device) =>
    device.kind === "processor" &&
    /intel/i.test(device.name ?? "") &&
    /\b\d{4,5}(?:KF|F)\b/i.test(device.name ?? "")
  );
  if (readings.length === 0) {
    const empty = document.createElement("p");
    empty.className = "sensor-empty";
    empty.textContent = tr("sensorNoReadings");
    readingGrid.append(empty);
  }
  for (const reading of readings) {
    const card = document.createElement("article");
    card.className = "sensor-card";
    const heading = document.createElement("div");
    heading.className = "sensor-card-heading";
    const name = document.createElement("strong");
    name.textContent = sensorLabel(reading);
    const type = document.createElement("span");
    type.textContent = tr(reading.kind === "processor" ? "sensorKindProcessor" : reading.kind === "graphics" ? "sensorKindGraphics" : reading.kind === "memory" ? "sensorKindMemory" : "sensorKindOther");
    heading.append(name, type);

    const value = document.createElement("div");
    value.className = "sensor-value";
    value.textContent = Number.isFinite(reading.watts) ? `${formatPower(reading.watts)} W` : `— W · ${tr("sensorWaiting")}`;

    const source = document.createElement("p");
    source.className = "sensor-provenance";
    source.textContent = `${tr("sensorSource")}: ${reading.source ?? tr("none")}`;
    const method = document.createElement("p");
    method.className = "sensor-provenance";
    const methodLabel = state.language === "vi"
      ? sensorMethodLabels.vi[reading.method] ?? reading.method
      : reading.method;
    method.textContent = `${tr("sensorMethod")}: ${methodLabel ?? tr("none")}`;
    card.append(heading, value, source, method);
    const notes = sensorReadingNotes[state.language] ?? sensorReadingNotes.en;
    if (Number.isFinite(reading.powerLimitWatts)) {
      const limit = document.createElement("p");
      limit.className = "sensor-provenance";
      limit.textContent = `${notes.powerLimit}: ${formatPower(reading.powerLimitWatts)} W`;
      card.append(limit);
    }
    if (reading.name === "RAPL_Package0_DRAM") {
      const shared = document.createElement("p");
      shared.className = "sensor-provenance";
      shared.textContent = notes.sharedDram;
      card.append(shared);
    }
    if (reading.name === "RAPL_Package0_PP1" && hasIntelFSeriesCpu) {
      const inactive = document.createElement("p");
      inactive.className = "sensor-provenance";
      inactive.textContent = notes.unusedPp1;
      card.append(inactive);
    }
    readingGrid.append(card);
  }

  const deviceList = $("#hardware-device-list");
  deviceList.replaceChildren();
  const devices = Array.isArray(snapshot.devices) ? snapshot.devices : [];
  const deviceCount = $("#hardware-device-count");
  if (deviceCount) deviceCount.textContent = tr("deviceCount", { count: devices.length });
  if (devices.length === 0) {
    const empty = document.createElement("p");
    empty.className = "sensor-empty";
    empty.textContent = tr("sensorNoDevices");
    deviceList.append(empty);
    return;
  }
  const kindKeys = {
    processor: "sensorKindProcessor", graphics: "sensorKindGraphics", memory: "sensorKindMemory", storage: "sensorKindStorage",
    keyboard: "sensorKindKeyboard", mouse: "sensorKindMouse", monitor: "sensorKindMonitor", usb: "sensorKindUsb", "usb-hub": "sensorKindUsbHub", "usb-controller": "sensorKindUsbController", battery: "sensorKindBattery",
    motherboard: "sensorKindMotherboard", cooling: "sensorKindCooling", "power-supply": "sensorKindPowerSupply"
  };
  for (const device of devices) {
    const row = document.createElement("article");
    row.className = "device-row";
    const details = document.createElement("div");
    details.className = "device-details";
    const name = document.createElement("strong");
    name.textContent = device.name ?? tr("sensorKindOther");
    const kind = document.createElement("span");
    kind.textContent = kindKeys[device.kind]
      ? tr(kindKeys[device.kind])
      : additionalKindLabels[state.language]?.[device.kind] ?? tr("sensorKindOther");
    details.append(name, kind);
    const capability = document.createElement("div");
    const isMeasured = device.measurementStatus === "measured";
    const isShared = device.measurementStatus === "shared";
    capability.className = `device-capability ${isMeasured ? "is-measured" : isShared ? "is-shared" : "is-unavailable"}`;
    const label = document.createElement("strong");
    const needsUsbMeter = ["keyboard", "mouse", "usb"].includes(device.kind);
    label.textContent = isMeasured
      ? tr("sensorMeasured")
      : isShared
        ? sharedMeasurementLabels[state.language]?.[device.kind] ?? sharedMeasurementLabels.en[device.kind]
        : needsUsbMeter ? tr("sensorNeedsUsbMeter") : tr("sensorNoLivePower");
    capability.append(label);
    if (Array.isArray(device.coveredBy) && device.coveredBy.length > 0) {
      const coverage = document.createElement("span");
      coverage.textContent = tr("sensorCoverage", { channels: device.coveredBy.map((name) => {
        const channel = readings.find((reading) => reading.name === name);
        return channel ? sensorLabel(channel) : name;
      }).join(", ") });
      capability.append(coverage);
    }
    const guideParts = device.measurementStatus === "measured" ? [] : [deviceMeasurementGuide(device)];
    if (device.sharedPowerPathWith?.length) {
      guideParts.push(tr("sensorSharedPowerPath", { devices: device.sharedPowerPathWith.join(", ") }));
    }
    const guideText = guideParts.filter(Boolean).join(" ");
    if (guideText) {
      const guideDisclosure = document.createElement("details");
      guideDisclosure.className = "device-guide-disclosure";
      const guideSummary = document.createElement("summary");
      guideSummary.textContent = tr("measurementGuide");
      const guide = document.createElement("span");
      guide.className = "device-measurement-guide";
      guide.textContent = guideText;
      guideDisclosure.append(guideSummary, guide);
      capability.append(guideDisclosure);
    }
    const estimate = renderPowerEstimate(device, state.language);
    if (estimate) {
      const estimateDisclosure = document.createElement("details");
      estimateDisclosure.className = "device-estimate-disclosure";
      const estimateSummary = document.createElement("summary");
      estimateSummary.textContent = tr("estimateDetails");
      estimateDisclosure.append(estimateSummary, estimate);
      capability.append(estimateDisclosure);
    }
    row.append(details, capability);
    deviceList.append(row);
  }
}

function formatPower(value) {
  return new Intl.NumberFormat(state.language === "vi" ? "vi-VN" : "en-US", { maximumFractionDigits: 1 }).format(value);
}

function formatTime(date) {
  return new Intl.DateTimeFormat(state.language === "vi" ? "vi-VN" : "en-US", { hour: "2-digit", minute: "2-digit" }).format(date);
}

document.querySelectorAll("[data-language]").forEach((button) => button.addEventListener("click", () => {
  state.language = button.dataset.language === "en" ? "en" : "vi";
  try {
    localStorage.setItem("power-monitor-lab.language", state.language);
  } catch {}
  applyLanguage();
}));
applyLanguage();
refreshSensors();
setInterval(refreshSensors, 3000);
