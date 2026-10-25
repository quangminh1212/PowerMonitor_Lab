# Bản đồ đo điện theo từng thiết bị trên PC này

Cập nhật: 25-10-2026. Mục tiêu là phân biệt số watt phần mềm đọc được ngay với số đo cần thiết bị điện tử mắc nối tiếp trên đúng nhánh nguồn.

## Kết quả kiểm tra trực tiếp trên máy

Máy chạy Windows 11, bo mạch ASRock H510M-HVS, Intel Core i3-10105F (4 nhân/8 luồng), NVIDIA GeForce GTX 1060 3GB, hai DIMM DDR4 8 GB/2667, SSD SATA Kingston A400 480 GB và HIKSEMI E100 512 GB, hai màn hình HKC-MB24V9 và Dell E2318H.

Tại snapshot lúc `2026-10-25 14:33:47 UTC`, app báo bốn kênh watt đang tự cập nhật:

- CPU package: khoảng 14.73 W.
- CPU PP0: khoảng 8.30 W.
- DRAM dùng chung: khoảng 0.95 W.
- GTX 1060 board draw: khoảng 9.75 W.

Đây là mẫu tức thời từ các cảm biến/counter của máy, không phải kết quả hiệu chuẩn bằng máy phân tích bên ngoài. Package và PP0 là các miền có thể chồng lấp; không cộng các miền này với nhau để tính điện cả PC. DRAM là miền chung, không phải watt riêng cho từng DIMM. Tổng đầu vào PC ở ổ cắm hiện vẫn `null`: chưa có meter AC được nối và cấu hình. LibreHardwareMonitor không chạy ở `127.0.0.1:8085`.

Windows liệt kê cả hai màn hình và hai SSD. PnP liệt kê hai interface bàn phím và hai interface chuột: các interface mang `VID_36AE&PID_FE9C` nằm chung một container USB composite; một interface chuột khác là `VID_1C4F&PID_0034`. Interface trùng nhóm không đồng nghĩa có cùng số thiết bị vật lý; phải đối chiếu đầu thu/cáp đang cắm. Hai SSD không trả về trường Power/Current/Voltage trong `Get-StorageReliabilityCounter`. WMI không liệt kê pin, quạt hay bộ nguồn ở máy này.

## Cách đo phù hợp cho từng nhóm

| Thiết bị / miền | Số liệu tự động hiện có | Cách lấy watt thật riêng hơn | Kết luận trên máy này |
| --- | --- | --- | --- |
| CPU i3-10105F | Windows EMI đưa counter năng lượng RAPL của package, PP0 và DRAM; app tính W trung bình từ chênh lệch counter | Đo DC tại nhánh EPS12V chỉ cho công suất đầu vào VRM/CPU ở mức rail; muốn tách theo từng nhân cần instrumentation nội bộ CPU, không có API bán lẻ tổng quát | Có công suất miền package và PP0; không có watt riêng mỗi nhân |
| GPU GTX 1060 3GB | `nvidia-smi`/NVML trả board power gần nhất; app cũng biết giới hạn power 120 W | NVML đã là đường phần mềm phù hợp; đo ngoài cần instrument nhánh PCIe 8-pin **và** điện cấp qua khe PCIe | Có board draw tự động; 120 W là giới hạn, không phải mức đang tiêu thụ |
| RAM 2 × 8 GB DDR4 | Một counter `RAPL_Package0_DRAM` dùng chung | Per-DIMM cần interposer/riser DDR4 có shunt đo V/A riêng cho rail của từng DIMM; đây là phần cứng đo kiểu phòng lab | App có thể phân bổ số chung theo dung lượng để tham khảo, nhưng không được gọi là số đo riêng DIMM |
| Bo mạch / VRM / quạt | Máy không có watt telemetry riêng. LibreHardwareMonitor có thể đọc thêm nhiệt độ, điện áp và RPM mà firmware/Super-I/O cung cấp; các giá trị này tự chúng không phải watt | Muốn có W phải đo cả V và A trên từng nhánh DC (EPS, ATX 24-pin, fan); cần breakout/instrumented power board và không mở bộ nguồn | Không có cách phần mềm hiện tại tách watt mainboard, VRM hoặc từng quạt |
| SSD Kingston A400 480 GB | SMART/Storage Reliability không cung cấp W live. Thông số Kingston nêu 0.195 W idle, 0.279 W trung bình, tối đa 0.642 W đọc và 1.535 W ghi | Một meter DC inline trên đường SATA power riêng của mỗi ổ, đo V và A | Các số theo spec/model không phải số đo thật; estimate không cộng vào tổng |
| SSD HIKSEMI E100 512 GB | Không có W live; app chỉ hiển thị giới hạn/estimate theo tài liệu thiết bị | Meter DC inline riêng cho nhánh nguồn của ổ | Không có số watt trực tiếp từ Windows/SMART trên máy này |
| Màn hình HKC-MB24V9 và Dell E2318H | Không có W live. DDC/CI có thể báo trạng thái nguồn/độ sáng; trạng thái không phải watt. Dell công bố 20 W typical và dưới 0.3 W sleep, nhưng đây là thông số chế độ, không phải phép đo hiện tại | Một ổ cắm AC meter cho mỗi màn hình; một meter nhiều kênh cũng được nếu từng kênh đo active power riêng | Hai estimate hiện có không thay thế meter. Một meter đặt trên ổ chia chung chỉ trả tổng của mọi thứ cùng cắm |
| Chuột/bàn phím có dây và thiết bị USB | USB descriptor có thể khai báo `bMaxPower` — dòng/công suất tối đa khai báo, không phải dòng đang dùng. Windows xHCI không cung cấp watt live từng cổng USB | Meter/hub USB **có data pass-through**, đo dòng từng cổng; để báo W đo được cần có cả điện áp VBUS thực và dòng. Hub chỉ báo mA nhân với 5 V danh định mới là ước tính | Cần xác nhận thiết bị USB 2.0 vẫn enumerate và hoạt động khi đi qua meter |
| Đầu thu USB của thiết bị không dây | Có thể đo công suất nhánh USB của đầu thu; đó chỉ là công suất của đầu thu | Meter USB trên đúng nhánh đầu thu | Không đại diện cho pin bên trong chuột/bàn phím |
| Chuột/bàn phím chạy pin | Phần trăm pin nếu thiết bị gửi báo cáo, không phải watt | Meter/shunt đặt trong mạch pin hoặc analyzer bàn thử phù hợp từng thiết bị; cần tháo/đấu nối phần cứng | Không có phép đo từ đầu thu PC cho lượng điện thiết bị tự dùng khi không cắm dây |
| Âm thanh, mạng, chipset và các tải nội bộ còn lại | Windows nhận diện Realtek audio/network và NVIDIA audio nhưng không có sensor W riêng | Có thể đo tổng PC tại ổ cắm; tách mỗi chip cần instrument từng rail trên bo mạch | Watt tổng nằm trong phép đo đầu vào PC; app không có căn cứ để phân bổ cho từng chip |
| Tổng điện đầu vào của cả PC | Không có sensor AC tại máy; RAPL `_Total` vẫn chỉ là tổng các counter nội bộ | Một AC power meter đo **active power W** và Wh, cắm riêng dây PC | Đây là meter tối thiểu để có tổng cả PC mà không ước lượng từ CPU/GPU |

## Các loại meter có thể dùng

### 1. AC meter cho PC và từng màn hình

Meter ổ cắm có hiển thị active power/energy, voltage và current là cách ít xâm lấn nhất. Ví dụ Shelly Plug PM Gen3 bản EU công bố 230 V, 50 Hz, đo V/A/power/energy và hỗ trợ local RPC; nhà sản xuất nêu tối đa 16 A / 3680 W **cho tải thuần trở**. Trước khi dùng với PSU PC hoặc màn hình phải kiểm tra loại phích, tải AC thực tế và định mức cho tải điện tử theo đúng tài liệu của biến thể bán tại nơi mua. Cắm meter riêng cho thùng PC; nếu muốn đo từng màn hình, mỗi màn hình cần một kênh AC được đo độc lập.

Shelly Pro 4PM có bốn `switch:N` component và API status theo từng kênh, phù hợp làm một meter nhiều nhánh AC nếu model/tải/lắp đặt phù hợp. Đây là thiết bị lắp trong tủ điện; phần đi dây mains cần người có chuyên môn. Phần mềm hiện tại chỉ chọn một component meter cho tổng PC, nên muốn dùng đủ bốn nhánh cần bổ sung cấu hình nhiều kênh và gán từng kênh cho thiết bị.

Power Monitor Lab đã có adapter local Shelly cho một kênh: đọc chỉ `Shelly.GetStatus`, lấy `apower` và `aenergy.total`, không bật/tắt relay. Nó chưa được kiểm tra trên meter vật lý vì hiện không có thiết bị Shelly được kết nối.

### 2. Meter/hub USB theo cổng

Cambrionix Hub API có thể trả `Port.N.Current_mA` theo cổng; đây là dòng điện, không phải một trường watt. Nếu chỉ nhân dòng với 5 V danh định thì kết quả phải ghi là ước tính; muốn W đúng cần voltage đo thực tế trên từng cổng. Một meter USB inline phải truyền được D+/D− và không làm gián đoạn HID.

Không nên mặc định dùng POWER-Z KM003C giữa PC và chuột/bàn phím: chính nhà sản xuất cảnh báo một số thiết bị USB 2.0 như mouse/keyboard có thể không hoạt động khi đặt meter ở giữa. KM003C phù hợp hơn để kiểm tra tải/thiết bị USB-C tương thích và ghi log riêng, không phải giải pháp chắc chắn cho HID USB 2.0 trong lúc sử dụng.

### 3. Meter DC cho ổ đĩa, quạt và rail máy tính

Đo DC bằng shunt phải đồng thời lấy điện áp và dòng. Texas Instruments INA226 là IC giám sát bus 0–36 V, đo shunt/current/voltage và tính power qua I²C/SMBus; nó là linh kiện để thiết kế một adapter/DAQ, không phải meter USB cắm là chạy. Cần một đường đo cho mỗi nhánh muốn tách riêng, firmware đọc dữ liệu, cách điện/cầu chì phù hợp và kiểm chứng sụt áp. Không mở PSU hoặc thao tác trên dây mains.

Đo per-DIMM/per-core còn hẹp hơn: cần interposer hoặc telemetry nội bộ phần cứng. Không có tiện ích Windows nào tự tạo ra những số đo vật lý mà bo mạch không cung cấp.

## Kế hoạch theo thứ tự có ích nhất

1. **Tổng điện PC:** nối PC qua một AC active-power meter tương thích và cấu hình host/password Shelly đã có trong app. Đây là bước duy nhất bổ sung số tổng thật ngay, nếu có meter phù hợp.
2. **Màn hình:** thêm một kênh AC riêng cho HKC và Dell; mở rộng app để quản lý nhiều meter/channel và hiển thị từng thiết bị.
3. **USB có dây:** chọn metered hub/meter có log theo cổng, data pass-through USB 2.0 được xác nhận, và V + A. Thêm adapter dữ liệu riêng; không dùng `bMaxPower` làm số đo.
4. **SSD/quạt/rail:** chỉ triển khai nếu cần phân rã thật bên trong PC; phải có DC breakout/instrumentation cho từng nhánh. Phần mềm-only không đủ.
5. **Thiết bị chạy pin:** nếu cần W trong lúc sử dụng, phải instrument ngay tại pin. Meter ở USB receiver hoặc cổng sạc không thay được đo đó.

Không có một “meter duy nhất” vừa đo PC, hai màn hình, mỗi SSD, mỗi DIMM, từng nhân CPU, chuột và bàn phím. Muốn đầy đủ per-device cần meter AC cho từng tải AC, meter DC cho từng nhánh DC/USB, và instrumentation pin cho thiết bị chạy pin. Mỗi số phải giữ nhãn nguồn và chất lượng; không cộng các miền chồng lấp hoặc thay số đo thật bằng estimate.

## Nguồn chính thức

- [Microsoft Energy Meter Interface](https://learn.microsoft.com/en-us/windows-hardware/drivers/powermeter/energy-meter-interface)
- [Intel SDM: RAPL domains](https://www.intel.com/content/dam/www/public/us/en/documents/manuals/64-ia-32-architectures-software-developer-vol-3b-part-2-manual.pdf)
- [NVIDIA NVML device power queries](https://docs.nvidia.com/deploy/nvml-api/latest/api/group__nvmlDeviceQueries.html)
- [Shelly PM1 status fields](https://shelly-api-docs.shelly.cloud/gen2/ComponentsAndServices/PM1/) · [Shelly switch status fields](https://shelly-api-docs.shelly.cloud/gen2/ComponentsAndServices/Switch/) · [Shelly multi-component model](https://shelly-api-docs.shelly.cloud/gen2/General/ComponentConcept/) · [Digest authentication](https://shelly-api-docs.shelly.cloud/gen2/General/Authentication/)
- [Shelly Plug PM Gen3 specifications](https://us.shelly.com/blogs/documentation/shelly-plug-pm-gen3)
- [USB-IF device configuration descriptor / maximum power field](https://www.usb.org/sites/default/files/pdcv10.pdf)
- [Cambrionix per-port current API](https://knowledge.cambrionix.com/Content/Software/Hub-API/User-Manual/Get_dictionaries/Port.N.Current_mA.htm)
- [POWER-Z KM003C support, including USB 2.0 mouse/keyboard caveat](https://www.power-z.com/blogs/technical-support/power-z-km003c-km002c-technical-support)
- [Texas Instruments INA226 voltage/current/power monitor](https://www.ti.com/product/INA226)
- [Kingston A400 power specifications](https://www.kingston.com/datasheets/sa400s37_us.pdf) · [HIKSEMI E100 product page](https://www.hiksemitech.com/pt/hiksemi/all-products/solid-state-drive/consumer-ssd/hs-ssd-e100.html)
- [Dell E2318H specifications](https://i.dell.com/sites/csdocuments/Product_Docs/en/dell_23_monitor_e2318h_product_spec_sheet.pdf) · [VESA MCCS announcement](https://www.vesa.org/wp-content/uploads/2010/12/PR42009MCCS.pdf)
