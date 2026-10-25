const kingstonA400Source = "https://www.kingston.com/datasheets/sa400s37_us.pdf";
const hiksemiE100Source = "https://www.hiksemitech.com/pt/hiksemi/all-products/solid-state-drive/consumer-ssd/hs-ssd-e100.html";
const dellE2318HSource = "https://i.dell.com/sites/csdocuments/Product_Docs/en/dell_23_monitor_e2318h_product_spec_sheet.pdf";
const hkcComparableSource = "https://www.energystar.gov/productfinder/product/certified-displays/details/4497038/export/pdf";
const hkcFamilyInputSource = "https://www.cqc.com.cn/www/upload/files/upload/resources/file/2025/05/19/63005.pdf";

function finiteNonNegative(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function roundWatts(value) {
  return Number.isFinite(value) ? Math.round(value * 1000) / 1000 : null;
}

function parseCapacityGb(device) {
  const explicit = Number(device.capacityGb);
  if (Number.isFinite(explicit) && explicit > 0) return explicit;
  const match = String(device.name ?? "").match(/\b(\d+(?:\.\d+)?)\s*GB\b/i);
  return match ? Number(match[1]) : null;
}

function estimateRange({ lowWatts, highWatts, typicalWatts = null, confidence = "low", method, methodVi, sources = [] }) {
  return {
    status: "range",
    lowWatts: roundWatts(lowWatts),
    highWatts: roundWatts(highWatts),
    typicalWatts: roundWatts(typicalWatts),
    confidence,
    method,
    methodVi,
    sources
  };
}

function includedIn(parent, method) {
  return {
    status: "included",
    parentDeviceId: parent?.id ?? null,
    parentName: parent?.name ?? null,
    confidence: "not-applicable",
    method,
    sources: []
  };
}

function estimateStorage(device) {
  const name = String(device.name ?? "");
  if (/KINGSTON.*SA400S37|SA400S37.*KINGSTON/i.test(name)) {
    const readBytesPerSecond = Number(device.readBytesPerSecond);
    const writeBytesPerSecond = Number(device.writeBytesPerSecond);
    const hasActivity = finiteNonNegative(readBytesPerSecond) || finiteNonNegative(writeBytesPerSecond);
    const idleWatts = 0.195;
    const readMaxWatts = 0.642;
    const writeMaxWatts = 1.535;
    const readMaxBytesPerSecond = 500_000_000;
    const writeMaxBytesPerSecond = 450_000_000;
    let estimatedWatts = null;
    if (hasActivity) {
      const readFraction = finiteNonNegative(readBytesPerSecond)
        ? Math.min(1, readBytesPerSecond / readMaxBytesPerSecond)
        : 0;
      const writeFraction = finiteNonNegative(writeBytesPerSecond)
        ? Math.min(1, writeBytesPerSecond / writeMaxBytesPerSecond)
        : 0;
      estimatedWatts = Math.min(
        writeMaxWatts,
        idleWatts + (readMaxWatts - idleWatts) * readFraction + (writeMaxWatts - idleWatts) * writeFraction
      );
    }
    return {
      status: hasActivity ? "modelled" : "range",
      estimatedWatts: roundWatts(estimatedWatts),
      lowWatts: idleWatts,
      highWatts: writeMaxWatts,
      typicalWatts: 0.279,
      confidence: "low",
      method: hasActivity
        ? "Throughput-scaled model using the current Windows disk byte counters and Kingston idle/read/write power figures; actual SSD power is not queried."
        : "Kingston idle, average and maximum read/write specification envelope; not a live measurement.",
      methodVi: hasActivity
        ? "Mô hình nội suy theo lưu lượng đọc/ghi Windows và thông số công suất nhàn rỗi/đọc/ghi của Kingston; ứng dụng không đọc watt thật của SSD."
        : "Khoảng thông số nhàn rỗi, trung bình và tối đa khi đọc/ghi của Kingston; không phải số đo trực tiếp.",
      sources: [{ label: "Kingston A400 specification", url: kingstonA400Source }],
      activity: hasActivity ? {
        readBytesPerSecond: finiteNonNegative(readBytesPerSecond) ? Math.round(readBytesPerSecond) : 0,
        writeBytesPerSecond: finiteNonNegative(writeBytesPerSecond) ? Math.round(writeBytesPerSecond) : 0
      } : null
    };
  }

  if (/HS-SSD-E100/i.test(name)) {
    return {
      status: "upper-bound",
      estimatedWatts: null,
      lowWatts: null,
      highWatts: 2.9,
      typicalWatts: null,
      confidence: "low",
      method: "The current manufacturer page lists a 2.9 W maximum for the 512 GB E100 family. It gives no current draw or usable idle value for this unit.",
      methodVi: "Trang nhà sản xuất ghi công suất tối đa 2,9 W cho dòng E100 512 GB; không có số đo hiện tại hay mức nhàn rỗi phù hợp cho ổ này.",
      sources: [{ label: "HIKSEMI E100 specification", url: hiksemiE100Source }]
    };
  }

  return unavailable("No device-specific storage power specification is available.", "Chưa có thông số công suất riêng cho mẫu ổ lưu trữ này.");
}

function estimateMonitor(device) {
  const name = String(device.name ?? "");
  if (/E2318H/i.test(name)) {
    return estimateRange({
      lowWatts: 0,
      highWatts: 20,
      typicalWatts: 20,
      confidence: "medium",
      method: "Dell lists 20 W typical in its on mode and less than 0.3 W in sleep. The app cannot read this monitor's current power state, so the displayed values are a range, not live watts.",
      methodVi: "Dell công bố 20 W ở chế độ bật và dưới 0,3 W khi ngủ. Ứng dụng không đọc được trạng thái nguồn hiện tại của màn hình, nên đây là khoảng tham khảo, không phải watt trực tiếp.",
      sources: [{ label: "Dell E2318H specification", url: dellE2318HSource }]
    });
  }

  if (/MB24V9/i.test(name)) {
    return {
      status: "adapter-rating",
      estimatedWatts: null,
      lowWatts: 24,
      highWatts: 30,
      typicalWatts: null,
      confidence: "very-low",
      method: "17.06 W is an ENERGY STAR on-mode value for a different 23.8-inch HKC model, not this exact monitor. The HKC MB24V9 family certificate lists 24–30 W adapter output ratings as an upper envelope, not actual consumption. Current state is unknown.",
      methodVi: "Mức 17,06 W thuộc một mẫu HKC 23,8 inch khác trong ENERGY STAR, không phải đúng màn hình này. Chứng nhận họ MB24V9 ghi đầu ra adapter 24–30 W, chỉ là giới hạn trên chứ không phải điện tiêu thụ. Trạng thái hiện tại chưa biết.",
      sources: [
        { label: "Comparable HKC monitor ENERGY STAR data", url: hkcComparableSource },
        { label: "HKC MB24V9 family certificate", url: hkcFamilyInputSource }
      ]
    };
  }

  return unavailable("No exact monitor model specification or live power-state reading is available.", "Chưa có thông số đúng mẫu màn hình hoặc số đo trạng thái nguồn hiện tại.");
}

function unavailable(method, methodVi = method) {
  return { status: "unavailable", confidence: "not-applicable", method, methodVi, sources: [] };
}

function estimateDevice(device, devices, readings) {
  if (device.measurementStatus === "measured") {
    return {
      status: "measured",
      confidence: "not-applicable",
      method: "Direct sensor readings are shown in the measured section; no separate estimate is generated.",
      sources: []
    };
  }

  if (device.kind === "memory") {
    const dram = readings.find((reading) => reading.source === "Windows Energy Metering Interface (EMI)" &&
      reading.kind === "memory" && /dram/i.test(reading.name ?? "") && finiteNonNegative(reading.watts));
    if (dram) {
      const modules = devices.filter((item) => item.kind === "memory");
      const capacities = modules.map(parseCapacityGb);
      const knownTotal = capacities.every((capacity) => Number.isFinite(capacity) && capacity > 0)
        ? capacities.reduce((sum, capacity) => sum + capacity, 0)
        : 0;
      const index = modules.findIndex((item) => item.id === device.id);
      const share = knownTotal > 0 ? capacities[index] / knownTotal : 1 / Math.max(1, modules.length);
      return {
        status: "allocated",
        estimatedWatts: roundWatts(dram.watts * share),
        lowWatts: null,
        highWatts: null,
        typicalWatts: null,
        confidence: "low",
        method: `The measured ${dram.name} aggregate is allocated by DIMM capacity (${Math.round(share * 100)}%); this is not an individual DIMM reading.`,
        methodVi: `Số đo tổng ${dram.name} được phân bổ theo dung lượng DIMM (${Math.round(share * 100)}%); đây không phải số đo riêng của thanh RAM.`,
        sources: []
      };
    }
    return unavailable("No individual DIMM telemetry or defensible per-DIMM estimate is available.", "Không có cảm biến riêng cho DIMM hoặc căn cứ đáng tin để ước tính từng thanh RAM.");
  }

  if (device.kind === "processor" || device.kind === "graphics") {
    return {
      status: "unavailable",
      confidence: "not-applicable",
      method: "No defensible current estimate is available when this device has no live power sensor.",
      methodVi: "Không có căn cứ đủ tin cậy để ước tính công suất hiện tại khi thiết bị không có cảm biến watt trực tiếp.",
      sources: []
    };
  }

  if (device.kind === "storage") return estimateStorage(device);
  if (device.kind === "monitor") return estimateMonitor(device);

  const graphics = devices.find((item) => item.kind === "graphics" && item.measurementStatus === "measured");
  if (device.kind === "audio" && /nvidia/i.test(device.name ?? "") && graphics) {
    return {
      ...includedIn(graphics, "This audio function is integrated on the measured graphics card and is not estimated separately."),
      methodVi: "Chức năng âm thanh này tích hợp trên card đồ họa có số đo; không ước tính riêng."
    };
  }
  return unavailable(
    "No device-specific model, live power telemetry, or defensible estimate range is available.",
    "Không có mô hình riêng, dữ liệu watt trực tiếp hoặc khoảng ước tính đủ căn cứ cho thiết bị này."
  );
}

export function attachDevicePowerEstimates(devices, readings) {
  return devices.map((device) => ({
    ...device,
    powerEstimate: estimateDevice(device, devices, readings)
  }));
}
