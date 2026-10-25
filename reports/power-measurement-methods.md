# Đo công suất tự động trên PC này

Cập nhật: 25-10-2026. Phạm vi là máy Windows đang chạy Power Monitor Lab.

## Đang đo tự động

Ứng dụng tự dò cảm biến phần cứng và cập nhật dashboard mỗi 3 giây. Windows quét lại danh sách thiết bị mỗi 15 giây. Hiện app đọc:

- Windows EMI / Intel RAPL: công suất trung bình tính từ chênh lệch bộ đếm năng lượng của CPU package, miền PP0 và DRAM.
- NVIDIA NVML qua `nvidia-smi`: lần đọc công suất board gần nhất của GTX 1060.

Snapshot trực tiếp gần nhất ghi nhận 4 kênh watt, 18 thiết bị được nhận diện: CPU và GPU có số đo gắn trực tiếp; hai DIMM dùng chung một kênh DRAM; 14 thiết bị/phần tử còn lại chưa có số watt trực tiếp. Tổng điện đầu vào của cả thùng máy vẫn là `null`.

Các số CPU package, PP0 và DRAM là miền đo riêng có thể chồng lấp. Không cộng chúng với nhau hoặc với GPU để suy ra điện ở ổ cắm. PP0 là miền CPU gộp, không phải số đo từng lõi. DRAM là số đo dùng chung, không phải số đo riêng từng thanh RAM.

Không có biểu mẫu ghi W thủ công. `POST /api/readings` bị tắt và trả HTTP 405; dashboard chỉ hiển thị số từ nguồn cảm biến tự động. Dữ liệu lịch sử cũ vẫn có thể đọc để tương thích, nhưng không thể ghi thêm theo cách thủ công.

## Phần cứng máy và đường đo còn thiếu

| Phần cứng | Trạng thái trên máy này | Để có watt thật riêng |
| --- | --- | --- |
| CPU | Đang đọc tự động qua EMI/RAPL; package và PP0 không phải hai phần để cộng | Không cần thêm thiết bị cho các miền mà CPU đang cung cấp |
| GPU GTX 1060 | Đang đọc tự động qua NVML | Không cần thêm thiết bị khi driver còn cung cấp số đo |
| Hai thanh RAM | Có một số đo DRAM dùng chung; app có thể phân bổ theo dung lượng để tham khảo | Cần đo dòng và áp trên từng nhánh nguồn DIMM; phân bổ không phải đo riêng |
| Hai SSD SATA | Không có watt trực tiếp trong Windows/SMART trên máy này | Đồng hồ DC V/A trên dây nguồn của từng ổ |
| Hai màn hình | Không có watt đang dùng qua Windows/DDC/CI | Một AC meter đo active power cho mỗi màn hình |
| Bàn phím, chuột, USB | USB khai báo dòng tối đa, không báo dòng đang dùng | Đồng hồ USB nối tiếp có truyền dữ liệu và đo V/A trên từng nhánh |
| Mainboard, VRM, quạt, mạng, âm thanh | Mainboard có thể báo điện áp/RPM; các giá trị này không phải watt | Cảm biến V/A trên nhánh cần tách; RPM/điện áp đơn lẻ không đủ tính công suất |
| Cả thùng máy | Chưa có cảm biến điện đầu vào; app để tổng là `null` | AC meter đo active power trên dây nguồn riêng của thùng máy |

Chuột/bàn phím không dây lấy năng lượng từ pin; đo đầu thu USB không đo được mức tiêu thụ của thiết bị chạy pin. Đồng hồ đặt trên ổ chia chung sẽ tính cả những thiết bị khác cùng cắm vào đó.

## Đường nâng cấp cho tổng điện thùng máy

Một AC meter có API cục bộ có thể đo tự động tổng điện đầu vào sau khi nối nó riêng với dây nguồn PC. Ví dụ, tài liệu Shelly Plug PM Gen3 dùng `PM1.GetStatus?id=0`; trạng thái có `apower` (W) và `aenergy.total` (Wh). Mẫu EU công bố 230 V / 50 Hz, 16 A và 3680 W cho tải điện trở. Mức tải điện trở này không tự chứng minh phù hợp với mọi bộ nguồn PC; cần kiểm tra đúng loại phích cắm, điện áp lưới và tải thực tế.

Power Monitor Lab hiện chưa kết nối hay hỗ trợ adapter Shelly. Vì vậy chưa có số tổng PC từ ổ cắm. Muốn có số này, cần meter thật trước; khi có thể tích hợp, app phải đọc API cục bộ theo chu kỳ và chỉ coi `apower` là watt đo được.

Hub USB Cambrionix có thể cung cấp dòng mA theo cổng; tài liệu ThunderSync3-16 không cho biết điện áp VBUS riêng từng cổng. Nhân dòng với 5 V danh định chỉ tạo ước tính, không phải watt đo trực tiếp. Muốn W trực tiếp cần cả V và A của nhánh đó.

LibreHardwareMonitor là nguồn cục bộ tùy chọn: app chỉ đọc `GET http://127.0.0.1:8085/data.json` và chỉ nhận cảm biến loại `Power`. Nguồn này hiện không chạy trên máy. Nó chỉ bổ sung kênh mà thiết bị/driver thật sự cung cấp, không biến RPM, điện áp hay tải CPU thành phép đo watt.

## Nguồn kỹ thuật

- [Microsoft Energy Meter Interface](https://learn.microsoft.com/en-us/windows-hardware/drivers/powermeter/energy-meter-interface)
- [Intel Software Developer Manual: RAPL](https://cdrdv2-public.intel.com/868137/325462-089-sdm-vol-1-2abcd-3abcd-4.pdf)
- [NVIDIA NVML device queries](https://docs.nvidia.com/deploy/nvml-api/latest/api/group__nvmlDeviceQueries.html)
- [ASRock H510M-HVS specifications](https://www.asrock.com/MB/Intel/H510M-HVS/index.asp)
- [USB-IF configuration descriptor](https://www.usb.org/sites/default/files/pdcv10.pdf)
- [Cambrionix per-port current API](https://knowledge.cambrionix.com/Content/Software/Hub-API/User-Manual/Get_dictionaries/Port.N.Current_mA.htm) and [ThunderSync3-16 measurement features](https://docs.cambrionix.com/products/thundersync3-16/user-manual/using-your-hub/hub-features)
- [Shelly PM1 local API](https://shelly-api-docs.shelly.cloud/gen2/ComponentsAndServices/PM1/) and [Plug PM Gen3 specifications](https://us.shelly.com/blogs/documentation/shelly-plug-pm-gen3)
