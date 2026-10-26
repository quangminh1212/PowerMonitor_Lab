const kingstonA400Source = "https://www.kingston.com/datasheets/sa400s37_us.pdf";
const hiksemiE100Source = "https://www.hiksemitech.com/pt/hiksemi/all-products/solid-state-drive/consumer-ssd/hs-ssd-e100.html";
const dellE2318HSource = "https://i.dell.com/sites/csdocuments/Product_Docs/en/dell_23_monitor_e2318h_product_spec_sheet.pdf";
const hkcComparableSource = "https://www.energystar.gov/productfinder/product/certified-displays/details/4497038/export/pdf";
const hkcFamilyInputSource = "https://www.cqc.com.cn/www/upload/files/upload/resources/file/2025/05/19/63005.pdf";
const usbMouseComparableSource = "https://www.imicro.com/product/details/MO-205U/";
const usbKeyboardComparableSource = "https://h20195.www2.hp.com/v2/GetDocument.aspx?docname=4AA7-9519ENW";

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
  const modelId = String(device.modelId ?? "").toUpperCase();
  if (/E2318H/i.test(name) || modelId === "DISPLAY\\DELF093") {
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

  if (/MB24V9/i.test(name) || modelId === "DISPLAY\\HKC0000") {
    return {
      status: "reference-range",
      lowWatts: 0,
      highWatts: 17.06,
      typicalWatts: null,
      confidence: "very-low",
      method: "17.06 W is an ENERGY STAR on-mode reference for a different 23.8-inch HKC model, not this exact monitor. The MB24V9 family certificate lists 24–30 W adapter output ratings; that is not the monitor's consumption. The app cannot read this monitor's current power state, so this is a very-low-confidence comparison range, not live watts.",
      methodVi: "Mức 17,06 W là mốc chế độ bật của một mẫu HKC 23,8 inch khác trong ENERGY STAR, không phải đúng model này. Chứng nhận họ MB24V9 ghi adapter đầu ra 24–30 W; đó không phải điện tiêu thụ của màn hình. Ứng dụng không đọc được trạng thái nguồn hiện tại nên đây chỉ là khoảng so sánh có độ tin cậy rất thấp, không phải số đo watt.",
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

function sharesContainerWithHidFunction(device, devices) {
  if (!device.containerId || !["keyboard", "mouse"].includes(device.kind)) return false;
  const containerId = String(device.containerId).toLowerCase();
  return devices.some((item) => item.id !== device.id &&
    String(item.containerId ?? "").toLowerCase() === containerId && ["keyboard", "mouse"].includes(item.kind));
}

function hasUsbPowerPath(device, devices) {
  const usbModelId = /^USB\\VID_[0-9A-F]{4}&PID_[0-9A-F]{4}$/i;
  if (usbModelId.test(device.modelId ?? "")) return true;
  if (!device.containerId) return false;
  const containerId = String(device.containerId).toLowerCase();
  return devices.some((item) => item.id !== device.id && item.kind === "usb" &&
    String(item.containerId ?? "").toLowerCase() === containerId && usbModelId.test(item.modelId ?? ""));
}

function estimateHidPeripheral(device) {
  const modelId = String(device.modelId ?? "");
  if (!/^(?:USB|HID)\\VID_[0-9A-F]{4}&PID_[0-9A-F]{4}$/i.test(modelId)) {
    return unavailable(
      "Windows did not provide a safe USB vendor/product ID for this peripheral.",
      "Windows chưa cung cấp mã nhà sản xuất/sản phẩm USB an toàn cho thiết bị này."
    );
  }

  if (device.kind === "mouse") {
    return {
      status: "reference-range",
      lowWatts: 0,
      highWatts: 0.385,
      typicalWatts: null,
      confidence: "very-low",
      method: `PnP ID ${modelId} identifies a USB mouse endpoint, but no verified power figure for this exact ID is available. The 0.385 W reference comes from a comparable wired optical mouse rated below 70 mA at up to 5.5 V; it is not this device's measured draw. For a wireless mouse, only the PC-side USB path is considered; battery use is excluded.`,
      methodVi: `Mã PnP ${modelId} nhận diện một nhánh chuột USB, nhưng chưa có công suất đã kiểm chứng cho đúng mã này. Mốc 0,385 W lấy từ chuột quang USB có dây tương đương, định mức dưới 70 mA ở mức tối đa 5,5 V; đây không phải số đo của thiết bị. Với chuột không dây, chỉ tính nhánh USB phía PC; không tính pin của chuột.`,
      sources: [{ label: "iMicro MO-205U comparable mouse specification", url: usbMouseComparableSource }]
    };
  }

  return {
    status: "reference-range",
    lowWatts: 0,
    highWatts: 0.5,
    typicalWatts: null,
    confidence: "very-low",
    method: `PnP ID ${modelId} identifies a USB keyboard endpoint, but no verified power figure for this exact ID is available. The 0.5 W reference uses a comparable basic wired keyboard rated at 5 V and up to 100 mA; backlit or gaming keyboards may use more. For a wireless keyboard, only the PC-side USB path is considered; battery use is excluded.`,
    methodVi: `Mã PnP ${modelId} nhận diện một nhánh bàn phím USB, nhưng chưa có công suất đã kiểm chứng cho đúng mã này. Mốc 0,5 W lấy từ bàn phím có dây phổ thông tương đương, định mức 5 V và tối đa 100 mA; bàn phím có đèn hoặc loại chơi game có thể dùng nhiều hơn. Với bàn phím không dây, chỉ tính nhánh USB phía PC; không tính pin của bàn phím.`,
    sources: [{ label: "HP 125 wired keyboard specification", url: usbKeyboardComparableSource }]
  };
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

  if (["keyboard", "mouse"].includes(device.kind)) {
    if (sharesContainerWithHidFunction(device, devices)) {
      const containerId = String(device.containerId).toLowerCase();
      const group = devices.filter((item) =>
        String(item.containerId ?? "").toLowerCase() === containerId && ["keyboard", "mouse"].includes(item.kind));
      const primary = [...group].sort((a, b) => a.kind.localeCompare(b.kind) || a.id.localeCompare(b.id))[0];
      if (device.id !== primary.id) {
        return {
          ...includedIn(primary, "This HID function shares one Windows container with another keyboard/mouse function; the physical USB path is kept together to avoid counting the same receiver twice."),
          methodVi: "Chức năng HID này cùng container Windows với một chức năng bàn phím/chuột khác; gộp chung đường USB vật lý để tránh tính đầu thu hai lần."
        };
      }
      return unavailable(
        "Multiple HID functions share one physical Windows device container. Their individual USB power cannot be separated, so no per-function estimate is shown.",
        "Nhiều chức năng HID cùng thuộc một thiết bị vật lý theo Windows. Không tách được điện USB của từng chức năng nên không hiển thị ước tính riêng."
      );
    }
    if (hasUsbPowerPath(device, devices)) return estimateHidPeripheral(device);
  }

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
