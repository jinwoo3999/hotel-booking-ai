# Sơ đồ Use Case – Trợ lý AI (Lumina Assistant)

## 1. Sơ đồ Use Case

```mermaid
left to right direction
skinparam useCase {
  BackgroundColor #E8F4FD
  BorderColor #1E40AF
  ArrowColor #1E40AF
}
skinparam actor {
  BackgroundColor #FEF3C7
  BorderColor #D97706
}

actor "Khách hàng" as Guest
actor "Hệ thống AI" as AI

rectangle "Trợ lý AI – Chat Widget" {
  usecase "Tìm khách sạn" as UC1
  usecase "Tìm phòng" as UC2
  usecase "Xem lịch sử đặt phòng" as UC3
  usecase "Kiểm tra voucher / khuyến mãi" as UC4
  usecase "Xem chính sách (check-in, hủy, hoàn tiền)" as UC5
  usecase "Hỗ trợ / Hướng dẫn" as UC6
  usecase "Chọn nhanh từ gợi ý (số thứ tự)" as UC7
}

Guest --> UC1
Guest --> UC2
Guest --> UC3
Guest --> UC4
Guest --> UC5
Guest --> UC6
Guest --> UC7

UC7 ..> UC1 : <<mở rộng>>
UC7 ..> UC2 : <<mở rộng>>
AI ..> UC1
AI ..> UC2
AI ..> UC3
AI ..> UC4
AI ..> UC5
AI ..> UC6
AI ..> UC7
```

---

## 2. Sơ đồ Use Case (dạng đơn giản – chỉ Khách hàng)

```mermaid
left to right direction

actor "Khách hàng" as Guest

rectangle "Trợ lý AI" {
  usecase "Tìm khách sạn theo địa điểm / tên" as U1
  usecase "Tìm phòng (giá, số người, ngày, view)" as U2
  usecase "Xem lịch sử đặt phòng" as U3
  usecase "Kiểm tra voucher, khuyến mãi" as U4
  usecase "Xem chính sách check-in, hủy, hoàn tiền" as U5
  usecase "Hỏi hướng dẫn / trợ giúp" as U6
  usecase "Chọn nhanh (bấm số từ danh sách)" as U7
}

Guest --> U1
Guest --> U2
Guest --> U3
Guest --> U4
Guest --> U5
Guest --> U6
Guest --> U7

U7 ..> U1 : mở rộng
U7 ..> U2 : mở rộng
```

---

## 3. Bảng Use Case – Phần AI

| STT | Mã UC | Tên use case | Tác nhân | Mô tả ngắn | Intent / Điều kiện kích hoạt | Kết quả chính |
|-----|-------|----------------|----------|-------------|------------------------------|----------------|
| 1 | UC-AI-01 | **Tìm khách sạn** | Khách hàng | Khách nhập yêu cầu theo địa điểm hoặc tên khách sạn qua chat. | Từ khóa: khách sạn, hotel, địa điểm, thành phố (VD: Đà Lạt, Phú Quốc, Hà Nội, Sài Gòn). | Hệ thống trả danh sách khách sạn phù hợp (tên, thành phố, giá từ); nếu hỏi đúng một khách sạn thì trả giới thiệu + danh sách phòng. |
| 2 | UC-AI-02 | **Tìm phòng** | Khách hàng | Khách mô tả nhu cầu: giá, số người, khoảng ngày, loại phòng/view. | Từ khóa: phòng, room, giá, tiền, view, suite, deluxe, số người, ngày. | Hệ thống trả phòng theo từng khách sạn; có ngày thì báo còn/hết phòng; gợi ý voucher nếu có. |
| 3 | UC-AI-03 | **Xem lịch sử đặt phòng** | Khách hàng | Khách yêu cầu xem đơn đặt phòng gần đây. | Từ khóa: lịch sử, booking, đơn đặt, reservation. **Điều kiện:** Đã đăng nhập. | Hệ thống trả tối đa 3 đơn gần nhất (tên khách sạn, địa điểm, trạng thái). Chưa đăng nhập thì nhắc đăng nhập. |
| 4 | UC-AI-04 | **Kiểm tra voucher / khuyến mãi** | Khách hàng | Khách hỏi về mã giảm giá, ưu đãi đang áp dụng. | Từ khóa: voucher, mã giảm, khuyến mãi, ưu đãi, coupon, promo. | Hệ thống trả danh sách voucher còn hiệu lực: mã, mức giảm, điều kiện đơn tối thiểu, hạn dùng. |
| 5 | UC-AI-05 | **Xem chính sách (check-in, hủy, hoàn tiền)** | Khách hàng | Khách hỏi giờ check-in/out, quy định hủy, hoàn tiền. | Từ khóa: chính sách, policy, check-in, check-out, hủy phòng, hoàn tiền, refund. | Hệ thống trả nội dung từ bảng Policy: giờ check-in/out, deadline hủy, % hoàn tiền, mô tả chính sách. |
| 6 | UC-AI-06 | **Hỗ trợ / Hướng dẫn** | Khách hàng | Khách chào hoặc hỏi trợ giúp, không chỉ rõ nghiệp vụ. | Từ khóa: giúp, help, hướng dẫn, chào, hello, hi. | Hệ thống trả lời giới thiệu ngắn và liệt kê các việc AI có thể làm (tìm khách sạn, phòng, lịch sử, voucher, chính sách). |
| 7 | UC-AI-07 | **Chọn nhanh từ gợi ý** | Khách hàng | Sau khi AI đưa danh sách khách sạn hoặc phòng, khách bấm nút/số thứ tự thay vì gõ lại tên. | Ngữ cảnh: tin nhắn trước đó của AI là danh sách có bullet (•) hoặc gạch đầu dòng; khách gửi số (1, 2, …) hoặc bấm quick select. | Hệ thống hiểu là chọn khách sạn/phòng tương ứng và trả giới thiệu chi tiết hoặc thông tin phòng; không hiển thị lại nút chọn nhanh khi đã vào chi tiết. |

---

## 4. Bảng Use Case – Chi tiết kỹ thuật (Intent & Luồng)

| Mã UC | Intent (API) | Luồng chính | Ghi chú |
|-------|----------------|-------------|---------|
| UC-AI-01 | `SEARCH_HOTEL` | 1) Parse message → tokens. 2) Lọc hotel theo tên/thành phố/địa chỉ. 3) Nếu có đề cập trực tiếp một khách sạn → trả intro + danh sách phòng; không thì trả danh sách gợi ý (tối đa 5). 4) Có thể kèm 1 voucher ưu đãi. | Dữ liệu từ `Hotel`, `Room`; không mock. |
| UC-AI-02 | `SEARCH_ROOM` | 1) Parse ngân sách, số người, khoảng ngày (nếu có). 2) Lọc phòng theo token, giá, capacity, view. 3) Có thể lọc theo một khách sạn nếu tên khách sạn có trong message. 4) Nhóm theo khách sạn; có ngày thì gọi `getRoomAvailabilitySummary` → hiển thị "còn X phòng" / "hết phòng". 5) Trả danh sách + voucher nếu có. | Dùng `RoomInventory` cho tồn kho theo ngày. |
| UC-AI-03 | `BOOKING_HISTORY` | 1) Kiểm tra session (đăng nhập). 2) Query `Booking` theo `userId`, include hotel (name, location). 3) Trả tối đa 3 đơn, sắp xếp mới nhất. | Chỉ dùng cho user đã đăng nhập. |
| UC-AI-04 | `CHECK_VOUCHERS` | 1) Query `Voucher` với `endDate >= now`, sort theo discount, take 5. 2) Format: mã, % hoặc số tiền giảm, đơn tối thiểu, hạn. 3) Có fallback raw query nếu schema khác. | Có try/catch, trả lời lỗi thân thiện nếu DB lỗi. |
| UC-AI-05 | `POLICY_INFO` | 1) Lấy bản ghi `Policy` id = "default". 2) Format: checkInTime, checkOutTime, cancellationDeadlineHours, refundPercent, refundPolicyText. | Chỉ đọc, không thay đổi policy. |
| UC-AI-06 | `HELP` | 1) Trả câu cố định liệt kê khả năng: tìm khách sạn, phòng, lịch sử, voucher, chính sách. | Không gọi DB nghiệp vụ. |
| UC-AI-07 | (dùng lại SEARCH_* + context) | 1) Client gửi `message` = số thứ tự và `context.lastAssistant` = nội dung tin nhắn AI trước đó. 2) Server parse danh sách từ `lastAssistant` → `parseAssistantOptions` → lấy phần tử đúng index. 3) Nếu là hotel → query hotel + rooms và trả intro + phòng; nếu là room → query room và trả chi tiết phòng. | Quick select ẩn khi nội dung AI chứa "Chi tiết phòng", "Giới thiệu", "Bạn muốn đặt phòng này không?". |

---

## 5. Tóm tắt tác nhân

| Tác nhân | Mô tả |
|----------|--------|
| **Khách hàng** | Người dùng website, có thể chưa đăng nhập hoặc đã đăng nhập. Tương tác với Trợ lý AI qua Floating Chat (gõ tin nhắn hoặc bấm chọn nhanh). |
| **Hệ thống AI** | Backend xử lý tin nhắn (API `/api/ai`): nhận diện intent, truy vấn DB, format và trả reply. Không có giao diện riêng; phục vụ Khách hàng qua chat. |

---

## 6. Cách kiểm tra nhanh

- Lịch sử đặt phòng → gõ: “lịch sử đặt phòng” → chọn số
- Hủy đơn → sau khi xem chi tiết, gõ: “hủy đơn”
- Ưu tiên → gõ: “phòng view biển đà lạt” / “gần trung tâm” / “phù hợp gia đình”
- Điểm vui chơi → gõ: “Đà Lạt” hoặc “Đà Nẵng”

---

*Tài liệu dùng cho phần Trợ lý AI (Lumina Assistant). Sơ đồ dùng Mermaid, có thể xem trên GitHub/GitLab hoặc công cụ hỗ trợ Mermaid.*
