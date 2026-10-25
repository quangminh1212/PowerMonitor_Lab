const translations = {
  en: {
    workspace: "WORKSPACE", workspaceShort: "Workspace", overview: "Overview", readingLog: "Reading log",
    privateTitle: "Your data stays here", privateBody: "Saved on this PC. Nothing is sent to a cloud service.", localHost: "Local host active", onThisDevice: "On this device",
    measurementNotebook: "MEASUREMENT NOTEBOOK", title: "Power, with context.", subtitle: "A local notebook for power readings and energy estimates.",
    filterMeter: "Filter by meter", allMeters: "All meters", timeRange: "Time range", last24Hours: "Last 24 hours", last7Days: "Last 7 days", last30Days: "Last 30 days", exportCsv: "Export CSV",
    manualOnlyTitle: "Manual readings only.", manualOnlyBody: "This MVP has no automatic sensor integration. Enter readings from an external meter; the app does not invent live watt values.", honestData: "HONEST DATA",
    latestLoggedPower: "LATEST LOGGED POWER", noReadings: "No readings yet", manualEntry: "MANUALLY RECORDED", estimatedEnergy: "ESTIMATED ENERGY", needTwoReadings: "Add two close readings to calculate energy", calculatedFromReadings: "CALCULATED FROM READINGS", loggedReadings: "LOGGED READINGS", entries: "entries", metersConfigured: "{count} meters tracked", savedOnDevice: "SAVED ON THIS DEVICE",
    powerTrend: "POWER TREND", readingsOverTime: "Readings over time", chartEmptyTitle: "Your trend starts with a reading", chartEmptyBody: "Record two readings to see a power trend.", loggedPower: "Logged power", wattsOverSelectedPeriod: "Watts · selected period",
    addToNotebook: "ADD TO NOTEBOOK", logReading: "Log a reading", formIntro: "Enter a value shown by your external power meter.", meterOrDevice: "Meter or device", powerReading: "Power reading", noteOptional: "Note", optional: "OPTIONAL", saveReading: "Save reading", savedLocally: "Saved locally · No account needed",
    measurementHistory: "MEASUREMENT HISTORY", recentReadings: "Recent readings", mostRecentFirst: "Most recent first", dateTime: "DATE & TIME", meter: "METER", power: "POWER", source: "SOURCE", note: "NOTE", actions: "Actions", historyEmptyTitle: "No readings in this period", historyEmptyBody: "Add a reading from your meter to start your local history.", showingLatest: "Showing the latest readings in this period", footerLeft: "POWER MONITOR LAB · PRIVATE BY DESIGN", footerRight: "Energy uses readings from this app session; gaps over 30 minutes are excluded.",
    enterMeter: "Enter a meter or device name.", invalidWatts: "Enter a power value from 0 to 100,000 W.", saveFailed: "Could not save the reading.", saved: "Reading saved on this device.", confirmDelete: "Delete this reading from your local history?", deleteFailed: "Could not delete the reading.", deleted: "Reading deleted.", exportFailed: "CSV export could not be created.", exportEmpty: "There are no readings to export in this period.",
    noReadingsPeriod: "No readings in this period", latestAt: "Logged {time}", noEnergy: "Add two readings less than 30 minutes apart in this app session to estimate energy.", energyDetail: "{minutes} min covered · {gaps} long gaps omitted", energyDetailNoGaps: "{minutes} min between readings", readingsCaption: "{count} readings in this period", meterCount: "{count} meters tracked", showingCount: "Showing {count} recent readings · newest first", refreshed: "Updated {time}", deleteLabel: "Delete reading", meterRequired: "Unnamed meter", none: "—", meterPlaceholder: "e.g. Desk plug meter", notePlaceholder: "e.g. Idle, display on", clearHistory: "Clear history", confirmClear: "Permanently clear all readings saved on this device? Export a CSV first if you need a backup.", historyCleared: "Local reading history cleared.", clearFailed: "Could not clear the local history."
  },
  vi: {
    workspace: "KHÔNG GIAN LÀM VIỆC", workspaceShort: "Không gian", overview: "Tổng quan", readingLog: "Nhật ký đo",
    privateTitle: "Dữ liệu ở trên máy này", privateBody: "Lưu trên PC này, không gửi lên dịch vụ đám mây.", localHost: "Máy chủ cục bộ đang chạy", onThisDevice: "Trên thiết bị này",
    measurementNotebook: "SỔ THEO DÕI SỐ ĐO", title: "Công suất, có ngữ cảnh.", subtitle: "Sổ ghi cục bộ cho số đo công suất và năng lượng ước tính.",
    filterMeter: "Lọc theo đồng hồ", allMeters: "Tất cả đồng hồ", timeRange: "Khoảng thời gian", last24Hours: "24 giờ qua", last7Days: "7 ngày qua", last30Days: "30 ngày qua", exportCsv: "Xuất CSV",
    manualOnlyTitle: "Chỉ ghi số đo thủ công.", manualOnlyBody: "Phiên bản này chưa tích hợp cảm biến tự động. Hãy nhập số từ đồng hồ ngoài; ứng dụng không tự tạo số watt trực tiếp.", honestData: "SỐ LIỆU RÕ NGUỒN",
    latestLoggedPower: "SỐ ĐO CÔNG SUẤT MỚI NHẤT", noReadings: "Chưa có số đo", manualEntry: "GHI NHẬN THỦ CÔNG", estimatedEnergy: "NĂNG LƯỢNG ƯỚC TÍNH", needTwoReadings: "Cần hai số đo gần nhau để tính năng lượng", calculatedFromReadings: "TÍNH TỪ CÁC SỐ ĐO", loggedReadings: "SỐ ĐO ĐÃ GHI", entries: "lần", metersConfigured: "Đang theo dõi {count} đồng hồ", savedOnDevice: "LƯU TRÊN THIẾT BỊ NÀY",
    powerTrend: "XU HƯỚNG CÔNG SUẤT", readingsOverTime: "Số đo theo thời gian", chartEmptyTitle: "Bắt đầu biểu đồ bằng một số đo", chartEmptyBody: "Ghi hai số đo để xem xu hướng công suất.", loggedPower: "Công suất đã ghi", wattsOverSelectedPeriod: "Watt · khoảng đã chọn",
    addToNotebook: "THÊM VÀO SỔ ĐO", logReading: "Ghi số đo", formIntro: "Nhập số hiển thị trên đồng hồ công suất ngoài.", meterOrDevice: "Đồng hồ hoặc thiết bị", powerReading: "Số đo công suất", noteOptional: "Ghi chú", optional: "KHÔNG BẮT BUỘC", saveReading: "Lưu số đo", savedLocally: "Lưu cục bộ · Không cần tài khoản",
    measurementHistory: "LỊCH SỬ ĐO", recentReadings: "Số đo gần đây", mostRecentFirst: "Mới nhất trước", dateTime: "NGÀY & GIỜ", meter: "ĐỒNG HỒ", power: "CÔNG SUẤT", source: "NGUỒN", note: "GHI CHÚ", actions: "Thao tác", historyEmptyTitle: "Chưa có số đo trong khoảng này", historyEmptyBody: "Thêm số đo từ đồng hồ để bắt đầu lịch sử cục bộ.", showingLatest: "Hiển thị số đo gần đây trong khoảng này", footerLeft: "POWER MONITOR LAB · RIÊNG TƯ THEO THIẾT KẾ", footerRight: "Năng lượng chỉ tính trong lần chạy này; khoảng trống trên 30 phút bị loại.",
    enterMeter: "Nhập tên đồng hồ hoặc thiết bị.", invalidWatts: "Nhập công suất từ 0 đến 100.000 W.", saveFailed: "Không lưu được số đo.", saved: "Đã lưu số đo trên thiết bị này.", confirmDelete: "Xóa số đo này khỏi lịch sử cục bộ?", deleteFailed: "Không xóa được số đo.", deleted: "Đã xóa số đo.", exportFailed: "Không tạo được tệp CSV.", exportEmpty: "Không có số đo nào trong khoảng này để xuất.",
    noReadingsPeriod: "Chưa có số đo trong khoảng này", latestAt: "Ghi lúc {time}", noEnergy: "Ghi hai số đo trong cùng lần chạy, cách nhau dưới 30 phút để ước tính năng lượng.", energyDetail: "Đã tính {minutes} phút · bỏ qua {gaps} khoảng trống dài", energyDetailNoGaps: "{minutes} phút giữa các số đo", readingsCaption: "{count} số đo trong khoảng này", meterCount: "Đang theo dõi {count} đồng hồ", showingCount: "Hiển thị {count} số đo gần nhất · mới nhất trước", refreshed: "Cập nhật {time}", deleteLabel: "Xóa số đo", meterRequired: "Đồng hồ chưa đặt tên", none: "—", meterPlaceholder: "VD: Ổ cắm đo công suất bàn làm việc", notePlaceholder: "VD: Chờ, màn hình bật", clearHistory: "Xóa lịch sử", confirmClear: "Xóa vĩnh viễn toàn bộ số đo lưu trên thiết bị này? Hãy xuất CSV trước nếu cần bản sao lưu.", historyCleared: "Đã xóa lịch sử số đo cục bộ.", clearFailed: "Không xóa được lịch sử cục bộ."
  }
};

const chartColors = ["#258b65", "#e39b44", "#7187b7", "#cf6f73", "#8768a8", "#3d9aa2"];
const state = { language: "en", range: "24h", meter: "", readings: [], summary: null, meters: [], toastTimer: null };
const $ = (selector) => document.querySelector(selector);

function tr(key, values = {}) {
  let value = translations[state.language][key] ?? translations.en[key] ?? key;
  for (const [name, replacement] of Object.entries(values)) value = value.replaceAll(`{${name}}`, String(replacement));
  return value;
}

function applyLanguage() {
  document.documentElement.lang = state.language;
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    if (key === "footerLeft") {
      element.replaceChildren(document.createTextNode(state.language === "vi" ? "POWER MONITOR LAB " : "POWER MONITOR LAB "));
      const dot = document.createElement("span");
      dot.className = "footer-dot";
      dot.textContent = "·";
      element.append(dot, document.createTextNode(state.language === "vi" ? " RIÊNG TƯ THEO THIẾT KẾ" : " PRIVATE BY DESIGN"));
    } else {
      element.textContent = tr(key);
    }
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => { element.placeholder = tr(element.dataset.i18nPlaceholder); });
  document.querySelectorAll("[data-language]").forEach((button) => {
    const active = button.dataset.language === state.language;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  const meterFilter = $("#meter-filter");
  meterFilter.setAttribute("aria-label", tr("filterMeter"));
  const rangeFilter = $("#range-filter");
  rangeFilter.setAttribute("aria-label", tr("timeRange"));
  renderMeters();
  if (state.summary) renderSummary();
  renderReadings();
  drawChart();
}

function setToast(message, error = false) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.toggle("error", error);
  toast.classList.add("visible");
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => toast.classList.remove("visible"), 3200);
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

function queryString() {
  const query = new URLSearchParams({ range: state.range });
  if (state.meter) query.set("meter", state.meter);
  return query.toString();
}

async function refresh() {
  try {
    const query = queryString();
    const [summary, readings, meters] = await Promise.all([
      requestJson(`/api/summary?${query}`),
      requestJson(`/api/readings?${query}`),
      requestJson("/api/meters")
    ]);
    state.summary = summary;
    state.readings = readings;
    state.meters = meters;
    renderMeters();
    renderSummary();
    renderReadings();
    drawChart();
    $("#refresh-caption").textContent = tr("refreshed", { time: formatTime(new Date()) });
  } catch (error) {
    setToast(error.message || tr("saveFailed"), true);
  }
}

function renderMeters() {
  const select = $("#meter-filter");
  const selected = state.meter;
  select.replaceChildren(new Option(tr("allMeters"), ""));
  const suggestions = $("#meter-suggestions");
  suggestions.replaceChildren();
  for (const meter of state.meters) {
    select.add(new Option(meter, meter));
    suggestions.append(new Option(meter, meter));
  }
  select.value = state.meters.includes(selected) ? selected : "";
  if (select.value !== selected) state.meter = select.value;
}

function formatPower(value) {
  return new Intl.NumberFormat(state.language === "vi" ? "vi-VN" : "en-US", { maximumFractionDigits: 1 }).format(value);
}

function formatEnergy(value) {
  if (value >= 1000) return { value: formatPower(value / 1000), unit: "kWh" };
  return { value: formatPower(value), unit: "Wh" };
}

function formatTime(date) {
  return new Intl.DateTimeFormat(state.language === "vi" ? "vi-VN" : "en-US", { hour: "2-digit", minute: "2-digit" }).format(date);
}

function formatDateTime(value) {
  const date = new Date(value);
  return new Intl.DateTimeFormat(state.language === "vi" ? "vi-VN" : "en-US", {
    year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit"
  }).format(date);
}

function renderSummary() {
  const summary = state.summary;
  if (!summary) return;
  const latest = summary.latestReading;
  $("#latest-value").textContent = latest ? formatPower(latest.watts) : "—";
  $("#latest-caption").textContent = latest ? tr("latestAt", { time: formatDateTime(latest.recordedAtUtc) }) : tr("noReadings");
  const energy = formatEnergy(summary.wattHours);
  $("#energy-value").textContent = summary.intervalsUsed > 0 ? energy.value : "—";
  $("#energy-unit").textContent = summary.intervalsUsed > 0 ? energy.unit : "Wh";
  if (summary.intervalsUsed > 0) {
    const minutes = formatPower(summary.coveredMinutes);
    $("#energy-caption").textContent = summary.gapsOmitted > 0
      ? tr("energyDetail", { minutes, gaps: summary.gapsOmitted })
      : tr("energyDetailNoGaps", { minutes });
  } else {
    $("#energy-caption").textContent = tr("noEnergy");
  }
  $("#reading-count").textContent = String(summary.readingsInRange);
  $("#meter-count").textContent = tr("meterCount", { count: summary.meterCount });
  $("#clear-history-button").hidden = summary.meterCount === 0;
  $("#history-caption").textContent = tr("readingsCaption", { count: summary.readingsInRange });
}

function createCell(text, className = "") {
  const cell = document.createElement("td");
  cell.textContent = text || tr("none");
  if (className) cell.className = className;
  cell.title = text || "";
  return cell;
}

function renderReadings() {
  const body = $("#reading-rows");
  body.replaceChildren();
  const readings = state.readings.slice(0, 50);
  $("#history-empty").hidden = readings.length > 0;
  $("#showing-caption").textContent = tr("showingCount", { count: readings.length });
  for (const reading of readings) {
    const row = document.createElement("tr");
    row.append(createCell(formatDateTime(reading.recordedAtUtc)));
    row.append(createCell(reading.meterName, "meter-cell"));
    row.append(createCell(`${formatPower(reading.watts)} W`, "power-cell"));
    const source = document.createElement("td");
    const pill = document.createElement("span");
    pill.className = "source-pill";
    pill.textContent = reading.source;
    source.append(pill);
    row.append(source);
    row.append(createCell(reading.note));
    const action = document.createElement("td");
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "delete-reading";
    remove.textContent = "×";
    remove.title = tr("deleteLabel");
    remove.setAttribute("aria-label", `${tr("deleteLabel")}: ${reading.meterName}, ${formatPower(reading.watts)} W`);
    remove.addEventListener("click", () => deleteReading(reading.id));
    action.append(remove);
    row.append(action);
    body.append(row);
  }
}

async function deleteReading(id) {
  if (!window.confirm(tr("confirmDelete"))) return;
  try {
    await requestJson(`/api/readings/${id}`, { method: "DELETE" });
    setToast(tr("deleted"));
    await refresh();
  } catch (error) {
    setToast(error.message || tr("deleteFailed"), true);
  }
}

async function clearHistory() {
  if (!window.confirm(tr("confirmClear"))) return;
  try {
    await requestJson("/api/readings", { method: "DELETE" });
    state.meter = "";
    setToast(tr("historyCleared"));
    await refresh();
  } catch (error) {
    setToast(error.message || tr("clearFailed"), true);
  }
}

function drawChart() {
  const canvas = $("#power-chart");
  if (!canvas) return;
  const rectangle = canvas.getBoundingClientRect();
  if (rectangle.width < 10 || rectangle.height < 10) return;
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(rectangle.width * ratio);
  canvas.height = Math.round(rectangle.height * ratio);
  const context = canvas.getContext("2d");
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  const width = rectangle.width;
  const height = rectangle.height;
  const left = 40;
  const right = width - 9;
  const top = 12;
  const bottom = height - 26;
  const now = Date.now();
  const duration = state.range === "7d" ? 7 * 86_400_000 : state.range === "30d" ? 30 * 86_400_000 : 86_400_000;
  const start = now - duration;
  const values = state.readings.map((reading) => Number(reading.watts)).filter(Number.isFinite);
  const maximum = Math.max(10, ...values);
  const axisMaximum = Math.max(10, Math.ceil(maximum / (maximum > 500 ? 100 : maximum > 100 ? 25 : 10)) * (maximum > 500 ? 100 : maximum > 100 ? 25 : 10));

  context.clearRect(0, 0, width, height);
  context.font = "9px Segoe UI, sans-serif";
  context.textAlign = "right";
  context.textBaseline = "middle";
  for (let index = 0; index <= 3; index++) {
    const y = top + (bottom - top) * index / 3;
    context.strokeStyle = "#edf1ee";
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(left, y);
    context.lineTo(right, y);
    context.stroke();
    context.fillStyle = "#9aa69f";
    context.fillText(formatPower(axisMaximum * (1 - index / 3)), left - 8, y);
  }

  context.textAlign = "center";
  context.textBaseline = "top";
  for (let index = 0; index <= 3; index++) {
    const x = left + (right - left) * index / 3;
    const date = new Date(start + duration * index / 3);
    const label = state.range === "24h"
      ? formatTime(date)
      : new Intl.DateTimeFormat(state.language === "vi" ? "vi-VN" : "en-US", { month: "short", day: "numeric" }).format(date);
    context.fillStyle = "#9aa69f";
    context.fillText(label, x, bottom + 8);
  }

  const groups = new Map();
  for (const reading of state.readings) {
    const time = new Date(reading.recordedAtUtc).getTime();
    if (!Number.isFinite(time) || time < start || time > now) continue;
    if (!groups.has(reading.meterName)) groups.set(reading.meterName, []);
    groups.get(reading.meterName).push({ time, watts: reading.watts });
  }
  const legend = $("#chart-legend");
  legend.replaceChildren();
  let seriesIndex = 0;
  for (const [name, samples] of groups) {
    samples.sort((a, b) => a.time - b.time);
    const color = chartColors[seriesIndex % chartColors.length];
    const legendItem = document.createElement("span");
    legendItem.className = "chart-legend-item";
    legendItem.title = name;
    const swatch = document.createElement("span");
    swatch.className = "chart-legend-swatch";
    swatch.classList.add(`series-${seriesIndex % chartColors.length}`);
    legendItem.append(swatch, document.createTextNode(name));
    legend.append(legendItem);

    const segments = [];
    let segment = [];
    for (const sample of samples) {
      if (segment.length > 0 && sample.time - segment[segment.length - 1].time > 30 * 60_000) {
        segments.push(segment);
        segment = [];
      }
      segment.push(sample);
    }
    if (segment.length > 0) segments.push(segment);

    context.strokeStyle = color;
    context.fillStyle = color;
    context.lineWidth = 2;
    context.lineJoin = "round";
    context.lineCap = "round";
    for (const samplesInSegment of segments) {
      if (samplesInSegment.length > 1) {
        context.beginPath();
        samplesInSegment.forEach((sample, index) => {
          const x = left + ((sample.time - start) / duration) * (right - left);
          const y = bottom - Math.max(0, Math.min(axisMaximum, sample.watts)) / axisMaximum * (bottom - top);
          if (index === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        });
        context.stroke();
      }
      for (const sample of samplesInSegment) {
        const x = left + ((sample.time - start) / duration) * (right - left);
        const y = bottom - Math.max(0, Math.min(axisMaximum, sample.watts)) / axisMaximum * (bottom - top);
        context.beginPath();
        context.arc(x, y, 2.6, 0, Math.PI * 2);
        context.fill();
      }
    }
    seriesIndex++;
  }

  const empty = state.readings.length === 0;
  $("#chart-empty").hidden = !empty;
  if (empty) {
    $("#chart-legend").replaceChildren();
    canvas.setAttribute("aria-label", tr("chartEmptyBody"));
  } else {
    canvas.setAttribute("aria-label", tr("readingsOverTime"));
  }
}

async function submitReading(event) {
  event.preventDefault();
  const meterName = $("#meter-name").value.trim();
  const watts = Number($("#watts-input").value);
  const note = $("#note-input").value.trim();
  if (!meterName) { setToast(tr("enterMeter"), true); $("#meter-name").focus(); return; }
  if (!Number.isFinite(watts) || watts < 0 || watts > 100000) { setToast(tr("invalidWatts"), true); $("#watts-input").focus(); return; }
  try {
    await requestJson("/api/readings", { method: "POST", body: JSON.stringify({ meterName, watts, note }) });
    $("#watts-input").value = "";
    $("#note-input").value = "";
    setToast(tr("saved"));
    await refresh();
    $("#watts-input").focus();
  } catch (error) {
    setToast(error.message || tr("saveFailed"), true);
  }
}

async function exportCsv() {
  try {
    const response = await fetch(`/api/export.csv?${queryString()}`);
    if (!response.ok) throw new Error(tr("exportFailed"));
    const csvText = await response.text();
    if (csvText.trim().split(/\r?\n/).length <= 1) { setToast(tr("exportEmpty"), true); return; }
    const content = new Blob([csvText], { type: "text/csv;charset=utf-8" });
    const objectUrl = URL.createObjectURL(content);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = "power-monitor-readings.csv";
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  } catch (error) {
    setToast(error.message || tr("exportFailed"), true);
  }
}

$("#reading-form").addEventListener("submit", submitReading);
$("#meter-filter").addEventListener("change", (event) => { state.meter = event.target.value; refresh(); });
$("#range-filter").addEventListener("change", (event) => { state.range = event.target.value; refresh(); });
$("#export-button").addEventListener("click", exportCsv);
$("#clear-history-button").addEventListener("click", clearHistory);
document.querySelectorAll("[data-language]").forEach((button) => button.addEventListener("click", () => {
  state.language = button.dataset.language;
  applyLanguage();
}));
window.addEventListener("resize", drawChart);
if ("ResizeObserver" in window) new ResizeObserver(drawChart).observe($(".chart-wrap"));
applyLanguage();
refresh();
setInterval(refresh, 30000);
