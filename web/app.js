const translations = {
  en: {
    documentTitle: "Power Monitor · Computer power",
    skipToContent: "Skip to content",
    localApp: "LOCAL MONITOR",
    mainNavigation: "Main navigation",
    deviceNav: "Devices",
    overview: "Live readings",
    language: "Language",
    localHost: "Running on this PC",
    privateBody: "Data stays on this computer.",
    footerLeft: "POWER MONITOR LAB · LOCAL ONLY",
    autoRefresh: "Auto-updating every 3 seconds",
    sensorUpdatedAt: "Auto-refresh every 3 seconds · {time}",
    measurementNotebook: "THIS COMPUTER",
    title: "Computer power",
    subtitle: "Automatically updated readings from the sensors available on this PC.",
    sensorEyebrow: "LIVE SENSOR READINGS",
    sensorHeading: "Measured components",
    sensorIntro: "Looking for power sensors on this computer.",
    sensorStatusStarting: "Discovering",
    sensorStatusAvailable: "Measuring",
    sensorStatusPartial: "Partial",
    sensorStatusUnavailable: "No live readings",
    sensorStatusUnsupported: "Windows only",
    sensorAvailableMessage: "Live readings are coming from sensors in this PC.",
    sensorPartialMessage: "Some devices were found, but they do not expose live watt readings.",
    sensorUnavailableMessage: "No supported live power sensor was found on this PC.",
    sensorUnsupportedMessage: "Automatic hardware readings are currently supported on Windows.",
    sensorProviderConnected: "connected",
    sensorProviderUnavailable: "not connected",
    sensorReadingsHeading: "Measured power",
    sensorReadingsNote: "Each value is a separate sensor channel. Do not add channels to get whole-PC power.",
    pcTotalEyebrow: "WHOLE PC",
    pcTotalHeading: "Input power at the outlet",
    pcTotalMeasuredState: "Measured live",
    pcTotalMissingState: "Meter not connected",
    pcTotalDisconnectedState: "Meter not responding",
    pcTotalSelectState: "Select outlet channel",
    pcTotalMeasuredDescription: "Active input is measured at the dedicated PC outlet.",
    pcTotalMissingDescription: "To measure the whole PC, connect it through a compatible AC meter. Once connected, readings update automatically; no watt entry is needed.",
    pcTotalDisconnectedDescription: "The meter is configured but not responding. Check its power, network connection, and device authentication.",
    pcTotalSelectDescription: "This meter reports several power channels. Select the exact channel feeding only this PC before showing its total.",
    pcTotalUnsupportedDescription: "Whole-PC meter integration currently runs on Windows. Component sensors available on this PC remain listed below.",
    pcTotalEnergy: "Energy this session: {energy} Wh",
    pcTotalMeterEnergyTotal: "Meter counter: {energy} kWh",
    meterDiscoverySearching: "Searching this local network for a Shelly power meter…",
    meterDiscoveryNotFound: "No meter found yet. CPU, graphics, and memory readings still update automatically. Whole-PC input needs a compatible outlet meter dedicated to the computer.",
    meterDiscoveryMultiple: "Several Shelly devices were found. Choose the one connected only to this computer.",
    meterDiscoveryDisconnected: "The selected meter is not responding. Check its power and local network connection.",
    meterDiscoverySelectedUnavailable: "The selected meter is temporarily missing from discovery. It remains selected while the app keeps checking.",
    meterDiscoveryAuthenticationRequired: "A Shelly device was found. Enter its device password to connect; the password stays in memory until this app closes.",
    meterVerifyAddress: "Verify the meter's local address before entering its password: {address}.",
    meterDiscoveryComponentSelection: "This meter has multiple power channels. Enter the channel connected only to this computer, such as pm1:0.",
    meterDiscoveryConnecting: "Shelly device found. Checking its live power sensor…",
    meterDiscoveryConnected: "Meter connected. Whole-PC power refreshes automatically every 3 seconds.",
    meterDiscoveryUnavailable: "Local meter discovery is unavailable. Put the computer and meter on the same local network.",
    meterDiscoveryNotAMeter: "Shelly device found, but it does not provide a supported live power channel.",
    meterDiscoveryConfigured: "Using the configured local meter. Readings refresh automatically every 3 seconds.",
    meterDiscoveryUnsupported: "Automatic outlet-meter discovery is currently supported on Windows.",
    meterDeviceLabel: "Meter connected to this computer",
    meterDeviceMissing: "not currently found",
    meterPasswordLabel: "Meter password (if required)",
    meterComponentLabel: "Power channel for this computer",
    meterConnectButton: "Connect meter",
    meterChangeButton: "Change meter",
    meterCancelButton: "Cancel",
    meterConnectionError: "Could not connect to that discovered meter. Check the password and try again.",
    sensorWaiting: "Waiting for the next sensor sample",
    sensorSource: "Source",
    sensorMethod: "Measurement",
    sensorDetails: "Sensor details",
    sensorMeasuredEnergy: "Measured energy since app start",
    sensorEstimatedEnergy: "Estimated energy since app start",
    sensorLabelPackage: "CPU package",
    sensorLabelCores: "CPU cores",
    sensorLabelDram: "Memory domain (DRAM)",
    sensorLabelGraphicsDomain: "Graphics domain (PP1)",
    sensorLabelGpu: "Graphics card",
    sensorLabelOther: "Energy channel",
    sensorKindProcessor: "Processor",
    sensorKindGraphics: "Graphics",
    sensorKindMemory: "Memory",
    sensorKindStorage: "Storage",
    sensorKindKeyboard: "Keyboard",
    sensorKindMouse: "Mouse / pointing device",
    sensorKindMonitor: "Monitor",
    sensorKindUsb: "USB device",
    sensorKindUsbHub: "USB hub",
    sensorKindUsbController: "USB controller",
    sensorKindBattery: "Battery",
    sensorKindMotherboard: "Motherboard",
    sensorKindCooling: "Fans / cooling",
    sensorKindPowerSupply: "Power supply",
    sensorKindOther: "Device",
    sensorInventoryHeading: "Detected devices",
    sensorInventoryScope: "Scanned again every 15 seconds",
    deviceCount: "{count} detected devices",
    sensorMeasured: "Live sensor reading",
    sensorNoLivePower: "No live watt reading",
    sensorNeedsUsbMeter: "Needs a separate meter",
    sensorCoverage: "Sensor channels: {channels}",
    sensorNoDevices: "Windows returned no hardware devices.",
    sensorNoReadings: "No live sensor readings are available.",
    sensorSharedPowerPath: "Same Windows USB device group as: {devices}; measure its branch once.",
    measurementGuide: "How to measure",
    estimateDetails: "Estimate details · not measured",
    technicalSources: "Sensor sources and details",
    sensorLhmHint: "LibreHardwareMonitor can add any additional live power channels this PC exposes.",
    historyEyebrow: "AUTOMATIC HISTORY",
    historyHeading: "Power history",
    historyCaption: "Sensor readings are saved automatically while the app runs.",
    historyRangeLabel: "History period",
    historyRange1h: "1 hour",
    historyRange6h: "6 hours",
    historyRange24h: "24 hours",
    historyRange7d: "7 days",
    historyNote: "Each line is a separate sensor channel. CPU, memory, and GPU channels do not add up to whole-PC input power.",
    historyEmpty: "History appears automatically when supported sensors report watts.",
    historyError: "Could not load local sensor history.",
    historyRetention: "Kept on this PC for {days} days",
    historySampleRate: "Saved every {seconds} seconds",
    historyChartLabel: "Automatic sensor power history in watts",
    historyLegendLabel: "Sensor channels in the chart",
    none: "—"
  },
  vi: {
    documentTitle: "Power Monitor · Công suất máy tính",
    skipToContent: "Bỏ qua điều hướng",
    localApp: "THEO DÕI CỤC BỘ",
    mainNavigation: "Điều hướng chính",
    deviceNav: "Thiết bị",
    overview: "Đang đo",
    language: "Ngôn ngữ",
    localHost: "Đang chạy trên máy này",
    privateBody: "Dữ liệu chỉ lưu cục bộ trên máy tính.",
    footerLeft: "POWER MONITOR LAB · LƯU CỤC BỘ",
    autoRefresh: "Tự cập nhật mỗi 3 giây",
    sensorUpdatedAt: "Tự cập nhật mỗi 3 giây · {time}",
    measurementNotebook: "MÁY TÍNH NÀY",
    title: "Công suất máy tính",
    subtitle: "Tự động cập nhật số đo từ các cảm biến có trên PC này.",
    sensorEyebrow: "SỐ ĐO CẢM BIẾN",
    sensorHeading: "Số đo linh kiện",
    sensorIntro: "Đang tìm cảm biến công suất trên máy tính này.",
    sensorStatusStarting: "Đang dò",
    sensorStatusAvailable: "Đang đo",
    sensorStatusPartial: "Một phần",
    sensorStatusUnavailable: "Chưa có số đo",
    sensorStatusUnsupported: "Chỉ hỗ trợ Windows",
    sensorAvailableMessage: "Đang nhận số đo trực tiếp từ cảm biến của máy tính.",
    sensorPartialMessage: "Đã nhận diện một số thiết bị, nhưng chúng không cung cấp số watt trực tiếp.",
    sensorUnavailableMessage: "Chưa tìm thấy cảm biến công suất trực tiếp được hỗ trợ trên PC này.",
    sensorUnsupportedMessage: "Hiện chỉ hỗ trợ tự động đọc cảm biến phần cứng trên Windows.",
    sensorProviderConnected: "đã kết nối",
    sensorProviderUnavailable: "chưa kết nối",
    sensorReadingsHeading: "Công suất đo trực tiếp",
    sensorReadingsNote: "Mỗi số là một kênh cảm biến riêng; không cộng các kênh để tính tổng PC.",
    pcTotalEyebrow: "TOÀN BỘ PC",
    pcTotalHeading: "Điện đầu vào tại ổ cắm",
    pcTotalMeasuredState: "Đang đo trực tiếp",
    pcTotalMissingState: "Chưa có đồng hồ",
    pcTotalDisconnectedState: "Mất kết nối đồng hồ",
    pcTotalSelectState: "Chọn kênh ổ cắm",
    pcTotalMeasuredDescription: "Đang đo điện đầu vào tại ổ cắm riêng của PC.",
    pcTotalMissingDescription: "Muốn đo cả máy, hãy nối riêng PC qua đồng hồ AC tương thích. Sau khi kết nối, số đo tự cập nhật; không cần nhập watt.",
    pcTotalDisconnectedDescription: "Đồng hồ đã cấu hình nhưng chưa phản hồi. Hãy kiểm tra nguồn điện, kết nối mạng và xác thực trên đồng hồ.",
    pcTotalSelectDescription: "Đồng hồ đang báo nhiều kênh công suất. Hãy chọn đúng kênh chỉ cấp cho PC trước khi hiện tổng.",
    pcTotalUnsupportedDescription: "Tích hợp đồng hồ đo cả PC hiện chạy trên Windows. Các cảm biến linh kiện của máy vẫn hiển thị bên dưới.",
    pcTotalEnergy: "Điện năng phiên này: {energy} Wh",
    pcTotalMeterEnergyTotal: "Bộ đếm đồng hồ: {energy} kWh",
    meterDiscoverySearching: "Đang tự tìm đồng hồ Shelly trong mạng nội bộ…",
    meterDiscoveryNotFound: "Chưa tìm thấy đồng hồ. CPU, đồ họa và RAM vẫn tự cập nhật. Muốn đo điện tổng của cả PC cần đồng hồ ổ cắm tương thích, chỉ cấp điện cho máy tính.",
    meterDiscoveryMultiple: "Tìm thấy nhiều thiết bị Shelly. Hãy chọn thiết bị chỉ nối với máy tính này.",
    meterDiscoveryDisconnected: "Đồng hồ đã chọn không phản hồi. Hãy kiểm tra nguồn và kết nối mạng nội bộ.",
    meterDiscoverySelectedUnavailable: "Tạm thời chưa thấy đồng hồ đã chọn khi dò mạng. Ứng dụng vẫn giữ lựa chọn này và tiếp tục kiểm tra.",
    meterDiscoveryAuthenticationRequired: "Đã tìm thấy thiết bị Shelly. Nhập mật khẩu của đồng hồ để kết nối; mật khẩu chỉ giữ trong bộ nhớ đến khi đóng ứng dụng.",
    meterVerifyAddress: "Hãy xác nhận IP nội bộ của đồng hồ trước khi nhập mật khẩu: {address}.",
    meterDiscoveryComponentSelection: "Đồng hồ có nhiều kênh. Nhập kênh chỉ cấp điện cho máy tính, ví dụ pm1:0.",
    meterDiscoveryConnecting: "Đã tìm thấy Shelly. Đang kiểm tra cảm biến công suất…",
    meterDiscoveryConnected: "Đã kết nối đồng hồ. Công suất toàn PC tự cập nhật mỗi 3 giây.",
    meterDiscoveryUnavailable: "Không dò được đồng hồ cục bộ. Hãy kết nối máy tính và đồng hồ vào cùng mạng nội bộ.",
    meterDiscoveryNotAMeter: "Đã tìm thấy Shelly nhưng thiết bị không có kênh đo công suất được hỗ trợ.",
    meterDiscoveryConfigured: "Đang dùng đồng hồ cục bộ đã cấu hình. Số đo tự cập nhật mỗi 3 giây.",
    meterDiscoveryUnsupported: "Hiện chỉ hỗ trợ tự tìm đồng hồ ổ cắm trên Windows.",
    meterDeviceLabel: "Đồng hồ nối riêng với máy tính này",
    meterDeviceMissing: "chưa tìm thấy lúc này",
    meterPasswordLabel: "Mật khẩu đồng hồ (nếu được yêu cầu)",
    meterComponentLabel: "Kênh đo cấp điện cho máy tính",
    meterConnectButton: "Kết nối đồng hồ",
    meterChangeButton: "Đổi đồng hồ",
    meterCancelButton: "Hủy",
    meterConnectionError: "Chưa kết nối được đồng hồ đã tìm thấy. Kiểm tra mật khẩu rồi thử lại.",
    sensorWaiting: "Đang chờ mẫu cảm biến tiếp theo",
    sensorSource: "Nguồn đo",
    sensorMethod: "Cách đo",
    sensorDetails: "Chi tiết cảm biến",
    sensorMeasuredEnergy: "Năng lượng đo được từ lúc mở ứng dụng",
    sensorEstimatedEnergy: "Năng lượng ước tính từ lúc mở ứng dụng",
    sensorLabelPackage: "CPU package",
    sensorLabelCores: "Lõi CPU",
    sensorLabelDram: "Miền bộ nhớ (DRAM)",
    sensorLabelGraphicsDomain: "Miền đồ họa (PP1)",
    sensorLabelGpu: "Card đồ họa",
    sensorLabelOther: "Kênh năng lượng",
    sensorKindProcessor: "Bộ xử lý",
    sensorKindGraphics: "Đồ họa",
    sensorKindMemory: "Bộ nhớ",
    sensorKindStorage: "Ổ lưu trữ",
    sensorKindKeyboard: "Bàn phím",
    sensorKindMouse: "Chuột / thiết bị trỏ",
    sensorKindMonitor: "Màn hình",
    sensorKindUsb: "Thiết bị USB",
    sensorKindUsbHub: "Hub USB",
    sensorKindUsbController: "Bộ điều khiển USB",
    sensorKindBattery: "Pin",
    sensorKindMotherboard: "Bo mạch chủ",
    sensorKindCooling: "Quạt / tản nhiệt",
    sensorKindPowerSupply: "Bộ nguồn",
    sensorKindOther: "Thiết bị",
    sensorInventoryHeading: "Thiết bị được nhận diện",
    sensorInventoryScope: "Tự quét lại mỗi 15 giây",
    deviceCount: "{count} thiết bị được nhận diện",
    sensorMeasured: "Có số đo trực tiếp",
    sensorNoLivePower: "Chưa có số đo watt",
    sensorNeedsUsbMeter: "Cần đồng hồ đo riêng",
    sensorCoverage: "Kênh cảm biến: {channels}",
    sensorNoDevices: "Windows chưa trả về danh sách thiết bị phần cứng.",
    sensorNoReadings: "Chưa có số đo cảm biến trực tiếp.",
    sensorSharedPowerPath: "Cùng nhóm thiết bị USB của Windows với: {devices}; chỉ cần đo một nhánh nguồn.",
    measurementGuide: "Cách đo",
    estimateDetails: "Chi tiết ước tính · không phải số đo",
    technicalSources: "Nguồn cảm biến và chi tiết",
    sensorLhmHint: "LibreHardwareMonitor có thể bổ sung các kênh công suất trực tiếp mà PC này hỗ trợ.",
    historyEyebrow: "LỊCH SỬ TỰ ĐỘNG",
    historyHeading: "Lịch sử công suất",
    historyCaption: "Ứng dụng tự lưu số đo cảm biến khi đang chạy.",
    historyRangeLabel: "Khoảng thời gian",
    historyRange1h: "1 giờ",
    historyRange6h: "6 giờ",
    historyRange24h: "24 giờ",
    historyRange7d: "7 ngày",
    historyNote: "Mỗi đường là một kênh cảm biến riêng. Kênh CPU, RAM và GPU không cộng thành điện đầu vào của cả PC.",
    historyEmpty: "Lịch sử tự xuất hiện khi cảm biến được hỗ trợ báo watt.",
    historyError: "Không tải được lịch sử cảm biến cục bộ.",
    historyRetention: "Lưu trên máy này trong {days} ngày",
    historySampleRate: "Tự lưu mỗi {seconds} giây",
    historyChartLabel: "Biểu đồ lịch sử watt tự động từ cảm biến",
    historyLegendLabel: "Các kênh cảm biến trên biểu đồ",
    none: "—"
  }
};
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
    sharedDram: "Shared memory-domain reading; not per-DIMM power."
  },
  vi: {
    powerLimit: "Giới hạn công suất GPU (mức trần, không phải mức đang dùng)",
    sharedDram: "Số đo miền bộ nhớ dùng chung, không phải watt riêng từng thanh RAM."
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
const state = {
  language: getSavedLanguage(),
  sensors: null,
  history: null,
  historyRange: "1h",
  meterFormOpen: false,
  meterConnectionErrorUntil: 0
};
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
  renderHistory();
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

async function refreshHistory() {
  try {
    state.history = await requestJson(`/api/history?range=${encodeURIComponent(state.historyRange)}`);
  } catch {
    state.history = { samples: [], error: true };
  }
  renderHistory();
}

function renderHistory() {
  const chart = $("#history-chart");
  const empty = $("#history-empty");
  const legend = $("#history-legend");
  if (!chart || !empty || !legend) return;

  const samples = (Array.isArray(state.history?.samples) ? state.history.samples : [])
    .filter((sample) => Number.isFinite(sample.watts) && Number.isFinite(Date.parse(sample.sampledAtUtc)));
  $("#history-note").textContent = tr("historyNote");
  $("#history-retention").textContent = tr("historyRetention", {
    days: state.history?.retentionDays ?? 7
  });
  $("#history-sample-rate").textContent = tr("historySampleRate", {
    seconds: state.history?.sampleIntervalSeconds ?? 30
  });
  chart.setAttribute("aria-label", tr("historyChartLabel"));
  legend.setAttribute("aria-label", tr("historyLegendLabel"));
  chart.replaceChildren();
  legend.replaceChildren();

  if (samples.length === 0) {
    chart.hidden = true;
    empty.hidden = false;
    empty.textContent = state.history?.error ? tr("historyError") : tr("historyEmpty");
    return;
  }

  chart.hidden = false;
  empty.hidden = true;
  const svgNamespace = "http://www.w3.org/2000/svg";
  const width = 760;
  const height = 260;
  const padding = { top: 16, right: 16, bottom: 35, left: 54 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const sampleBounds = samples.reduce((bounds, sample) => {
    const timestamp = Date.parse(sample.sampledAtUtc);
    return {
      from: Math.min(bounds.from, timestamp),
      to: Math.max(bounds.to, timestamp),
      peak: Math.max(bounds.peak, sample.watts)
    };
  }, { from: Number.POSITIVE_INFINITY, to: Number.NEGATIVE_INFINITY, peak: 0 });
  const from = Date.parse(state.history?.fromUtc ?? "") || sampleBounds.from;
  const to = Date.parse(state.history?.toUtc ?? "") || sampleBounds.to;
  const timeSpan = Math.max(1, to - from);
  const maxWatts = Math.max(10, Math.ceil(sampleBounds.peak / 10) * 10);
  const pointX = (sample) => padding.left + ((Date.parse(sample.sampledAtUtc) - from) / timeSpan) * plotWidth;
  const pointY = (watts) => padding.top + (1 - Math.min(watts, maxWatts) / maxWatts) * plotHeight;

  for (let tick = 0; tick <= 2; tick += 1) {
    const watts = maxWatts * (1 - tick / 2);
    const y = padding.top + (tick / 2) * plotHeight;
    const line = document.createElementNS(svgNamespace, "line");
    line.setAttribute("x1", String(padding.left));
    line.setAttribute("x2", String(width - padding.right));
    line.setAttribute("y1", String(y));
    line.setAttribute("y2", String(y));
    line.setAttribute("class", "history-gridline");
    chart.append(line);

    const label = document.createElementNS(svgNamespace, "text");
    label.setAttribute("x", String(padding.left - 9));
    label.setAttribute("y", String(y + 4));
    label.setAttribute("text-anchor", "end");
    label.setAttribute("class", "history-axis-label");
    label.textContent = `${formatPower(watts)} W`;
    chart.append(label);
  }

  const leftTime = document.createElementNS(svgNamespace, "text");
  leftTime.setAttribute("x", String(padding.left));
  leftTime.setAttribute("y", String(height - 8));
  leftTime.setAttribute("class", "history-axis-label");
  leftTime.textContent = formatHistoryTime(from, state.historyRange);
  chart.append(leftTime);

  const rightTime = document.createElementNS(svgNamespace, "text");
  rightTime.setAttribute("x", String(width - padding.right));
  rightTime.setAttribute("y", String(height - 8));
  rightTime.setAttribute("text-anchor", "end");
  rightTime.setAttribute("class", "history-axis-label");
  rightTime.textContent = formatHistoryTime(to, state.historyRange);
  chart.append(rightTime);

  const bySensor = new Map();
  for (const sample of samples) {
    const series = bySensor.get(sample.sensorId) ?? [];
    series.push(sample);
    bySensor.set(sample.sensorId, series);
  }
  const colors = ["#21825d", "#d88b31", "#667ca8", "#bd6265", "#8061a0", "#318b91"];
  [...bySensor.values()].forEach((unsampledSeries, index) => {
    const series = unsampledSeries.sort((left, right) => Date.parse(left.sampledAtUtc) - Date.parse(right.sampledAtUtc));
    const points = downsampleHistory(series);
    const color = colors[index % colors.length];
    const path = document.createElementNS(svgNamespace, "path");
    path.setAttribute("class", "history-series");
    path.setAttribute("stroke", color);
    path.setAttribute("d", points.map((sample, pointIndex) =>
      `${pointIndex === 0 ? "M" : "L"}${pointX(sample).toFixed(1)} ${pointY(sample.watts).toFixed(1)}`
    ).join(" "));
    const title = document.createElementNS(svgNamespace, "title");
    title.textContent = `${sensorLabel(series[0])} · ${series[0].source}`;
    path.append(title);
    chart.append(path);

    const legendItem = document.createElement("span");
    legendItem.className = "chart-legend-item";
    const swatch = document.createElement("span");
    swatch.className = "chart-legend-swatch";
    swatch.style.backgroundColor = color;
    const label = document.createElement("span");
    label.textContent = sensorLabel(series[0]);
    legendItem.append(swatch, label);
    legend.append(legendItem);
  });
}

function formatHistoryTime(timestamp, range) {
  const options = { hour: "2-digit", minute: "2-digit" };
  if (range === "7d") {
    options.month = "short";
    options.day = "numeric";
  }
  return new Intl.DateTimeFormat(state.language === "vi" ? "vi-VN" : "en-US", options)
    .format(new Date(timestamp));
}

function downsampleHistory(samples, limit = 500) {
  if (samples.length <= limit) return samples;
  const step = (samples.length - 1) / (limit - 1);
  return Array.from({ length: limit }, (_, index) => samples[Math.round(index * step)]);
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

function renderPcTotal(snapshot) {
  const valueElement = $("#pc-total-value");
  const stateElement = $("#pc-total-state");
  const descriptionElement = $("#pc-total-description");
  const detailElement = $("#pc-total-detail");
  const cardElement = document.querySelector(".pc-total-card");
  if (!valueElement || !stateElement || !descriptionElement || !detailElement || !cardElement) return;

  const readings = Array.isArray(snapshot.readings) ? snapshot.readings : [];
  const reading = readings.find((item) => item.id === "shelly-pc-input");
  const meterProvider = (Array.isArray(snapshot.providers) ? snapshot.providers : [])
    .find((provider) => provider.id === "shelly-local-meter");
  const needsComponentSelection = [
    "multiple-meter-channels",
    "invalid-component-id",
    "selected-component-unavailable"
  ].includes(meterProvider?.reason);
  const watts = Number.isFinite(snapshot.totalPowerWatts) && snapshot.totalPowerWatts >= 0
    ? snapshot.totalPowerWatts
    : null;
  const stateKey = watts !== null
    ? "measured"
    : snapshot.status === "unsupported"
      ? "unsupported"
      : needsComponentSelection
        ? "selection"
        : meterProvider?.configured
        ? "disconnected"
        : "missing";

  cardElement.dataset.state = stateKey;
  valueElement.dataset.state = watts === null ? "unavailable" : "measured";
  valueElement.textContent = watts === null ? "— W" : `${formatPower(watts)} W`;
  stateElement.dataset.state = stateKey === "measured" ? "measured" : stateKey;
  stateElement.textContent = tr({
    measured: "pcTotalMeasuredState",
    missing: "pcTotalMissingState",
    disconnected: "pcTotalDisconnectedState",
    selection: "pcTotalSelectState",
    unsupported: "sensorStatusUnsupported"
  }[stateKey]);
  descriptionElement.textContent = tr({
    measured: "pcTotalMeasuredDescription",
    missing: "pcTotalMissingDescription",
    disconnected: "pcTotalDisconnectedDescription",
    selection: "pcTotalSelectDescription",
    unsupported: "pcTotalUnsupportedDescription"
  }[stateKey]);

  const detailParts = [];
  if (Number.isFinite(reading?.voltage) && reading.voltage > 0) {
    detailParts.push(`${formatPower(reading.voltage)} V`);
  }
  if (Number.isFinite(reading?.current) && reading.current >= 0) {
    detailParts.push(`${formatPower(reading.current)} A`);
  }
  if (Number.isFinite(reading?.absoluteEnergyWh) && reading.absoluteEnergyWh >= 0) {
    detailParts.push(tr("pcTotalMeterEnergyTotal", {
      energy: formatEnergy(reading.absoluteEnergyWh / 1_000)
    }));
  }
  if (Number.isFinite(reading?.energyWhSinceStart)) {
    detailParts.push(tr("pcTotalEnergy", { energy: formatEnergy(reading.energyWhSinceStart) }));
  }
  detailElement.textContent = detailParts.join(" · ");
  detailElement.hidden = detailParts.length === 0;
}

function renderMeterDiscovery(snapshot) {
  const discovery = snapshot.meterDiscovery ?? { state: "not-found", devices: [] };
  const unsupported = snapshot.status === "unsupported";
  const knownStates = new Set([
    "searching", "not-found", "multiple", "authentication-required", "component-selection",
    "connecting", "connected", "unavailable", "not-a-meter", "configured", "disconnected", "selected-unavailable"
  ]);
  const stateKey = unsupported ? "unsupported" : knownStates.has(discovery.state) ? discovery.state : "not-found";
  const status = $("#meter-discovery-status");
  const form = $("#meter-connect-form");
  const deviceField = $("#meter-device-field");
  const deviceSelect = $("#meter-device");
  const passwordField = $("#meter-password-field");
  const componentField = $("#meter-component-field");
  if (!status || !form || !deviceSelect) return;

  const devices = Array.isArray(discovery.devices) ? discovery.devices : [];
  const selectedDevice = devices.find((device) => device.id === discovery.selectedDeviceId);
  const selectedAddress = selectedDevice?.host
    ? `${selectedDevice.host}${selectedDevice.port && selectedDevice.port !== 80 ? `:${selectedDevice.port}` : ""}`
    : "";
  const discoveryMessage = tr(`meterDiscovery${stateKey[0].toLocaleUpperCase("en-US")}${stateKey.slice(1).replace(/-([a-z])/g, (_match, letter) => letter.toLocaleUpperCase("en-US"))}`);
  const hasConnectionError = state.meterConnectionErrorUntil > Date.now();
  status.dataset.state = hasConnectionError ? "unavailable" : stateKey;
  status.textContent = hasConnectionError
    ? tr("meterConnectionError")
    : stateKey === "authentication-required" && selectedAddress
      ? `${discoveryMessage} ${tr("meterVerifyAddress", { address: selectedAddress })}`
      : discoveryMessage;
  const previousDeviceId = deviceSelect.value;
  deviceSelect.replaceChildren();
  for (const device of devices) {
    const option = document.createElement("option");
    option.value = device.id;
    option.textContent = [
      device.name,
      device.model,
      device.host ? `${device.host}${device.port && device.port !== 80 ? `:${device.port}` : ""}` : "",
      device.discovered === false ? tr("meterDeviceMissing") : ""
    ].filter(Boolean).join(" · ");
    option.disabled = device.discovered === false;
    deviceSelect.append(option);
  }
  const selectedDeviceId = discovery.selectedDeviceId;
  const discoveredDevices = devices.filter((device) => device.discovered !== false);
  const selectedIsDiscovered = discoveredDevices.some((device) => device.id === selectedDeviceId);
  if (state.meterFormOpen && !discoveredDevices.some((device) => device.id === previousDeviceId)) {
    deviceSelect.value = discoveredDevices[0]?.id ?? "";
  } else if (discoveredDevices.some((device) => device.id === previousDeviceId)) {
    deviceSelect.value = previousDeviceId;
  } else if (selectedDeviceId && (selectedIsDiscovered || !discoveredDevices.length)) {
    deviceSelect.value = selectedDeviceId;
  } else if (discoveredDevices.length === 1) {
    deviceSelect.value = discoveredDevices[0].id;
  }

  const needsDeviceChoice = stateKey === "multiple" || stateKey === "selected-unavailable" ||
    state.meterFormOpen || (!selectedDeviceId && discoveredDevices.length > 1) ||
    (selectedDeviceId && !selectedIsDiscovered && discoveredDevices.length > 0);
  const needsPassword = stateKey === "authentication-required" || stateKey === "multiple" || state.meterFormOpen;
  const needsComponent = stateKey === "component-selection";
  const showForm = !unsupported && (needsDeviceChoice || needsPassword || needsComponent);
  const changeButton = $("#meter-change-button");
  const cancelButton = $("#meter-cancel-button");
  const canChangeMeter = Boolean(selectedDeviceId) && discoveredDevices.some((device) => device.id !== selectedDeviceId);
  form.hidden = !showForm;
  deviceField.hidden = !needsDeviceChoice;
  passwordField.hidden = !needsPassword;
  componentField.hidden = !needsComponent;
  if (changeButton) changeButton.hidden = !canChangeMeter || state.meterFormOpen;
  if (cancelButton) cancelButton.hidden = !state.meterFormOpen;
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
  renderPcTotal(snapshot);
  renderMeterDiscovery(snapshot);
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
  const readings = (Array.isArray(snapshot.readings) ? snapshot.readings : [])
    .filter((reading) => reading.id !== "shelly-pc-input");
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

    const details = document.createElement("details");
    details.className = "sensor-card-details";
    const detailsSummary = document.createElement("summary");
    detailsSummary.textContent = tr("sensorDetails");
    details.append(detailsSummary);
    const source = document.createElement("p");
    source.className = "sensor-provenance";
    source.textContent = `${tr("sensorSource")}: ${reading.source ?? tr("none")}`;
    const method = document.createElement("p");
    method.className = "sensor-provenance";
    const methodLabel = state.language === "vi"
      ? sensorMethodLabels.vi[reading.method] ?? reading.method
      : reading.method;
    method.textContent = `${tr("sensorMethod")}: ${methodLabel ?? tr("none")}`;
    details.append(source, method);
    if (Number.isFinite(reading.energyWhSinceStart)) {
      const energy = document.createElement("p");
      energy.className = "sensor-provenance";
      const energyLabel = Number.isFinite(reading.absoluteEnergyWh) || typeof reading.absoluteEnergyPwh === "string"
        ? tr("sensorMeasuredEnergy")
        : tr("sensorEstimatedEnergy");
      energy.textContent = `${energyLabel}: ${formatEnergy(reading.energyWhSinceStart)} Wh`;
      details.append(energy);
    }
    const notes = sensorReadingNotes[state.language] ?? sensorReadingNotes.en;
    if (Number.isFinite(reading.powerLimitWatts)) {
      const limit = document.createElement("p");
      limit.className = "sensor-provenance";
      limit.textContent = `${notes.powerLimit}: ${formatPower(reading.powerLimitWatts)} W`;
      details.append(limit);
    }
    if (reading.name === "RAPL_Package0_DRAM") {
      const shared = document.createElement("p");
      shared.className = "sensor-provenance";
      shared.textContent = notes.sharedDram;
      details.append(shared);
    }
    card.append(heading, value, details);
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

function formatEnergy(value) {
  return new Intl.NumberFormat(state.language === "vi" ? "vi-VN" : "en-US", {
    minimumFractionDigits: value < 1 ? 3 : 2,
    maximumFractionDigits: 3
  }).format(value);
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
$("#meter-connect-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const deviceId = $("#meter-device").value || (state.sensors?.meterDiscovery?.configured ? "configured-meter" : "");
  const password = $("#meter-password").value;
  const componentId = $("#meter-component").value.trim();
  const button = $("#meter-connect-button");
  if (!deviceId) return;
  button.disabled = true;
  try {
    await requestJson("/api/meter/configure", {
      method: "POST",
      body: JSON.stringify({ deviceId, password, componentId })
    });
    $("#meter-password").value = "";
    $("#meter-component").value = "";
    state.meterFormOpen = false;
    state.meterConnectionErrorUntil = 0;
    await refreshSensors();
  } catch {
    state.meterConnectionErrorUntil = Date.now() + 6_000;
    renderMeterDiscovery(state.sensors ?? {});
  } finally {
    button.disabled = false;
  }
});
$("#meter-change-button").addEventListener("click", () => {
  state.meterFormOpen = true;
  renderMeterDiscovery(state.sensors ?? {});
});
$("#meter-cancel-button").addEventListener("click", () => {
  state.meterFormOpen = false;
  $("#meter-password").value = "";
  renderMeterDiscovery(state.sensors ?? {});
});
$("#history-range").addEventListener("change", (event) => {
  state.historyRange = event.currentTarget.value;
  void refreshHistory();
});
applyLanguage();
refreshSensors();
refreshHistory();
setInterval(refreshSensors, 3000);
setInterval(refreshHistory, 30000);
