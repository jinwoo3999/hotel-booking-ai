# HƯỚNG DẪN DEMO DỰ ÁN LUMINA STAY

## CHUẨN BỊ TRƯỚC KHI DEMO

### 1. Chạy server
```bash
cd hotel-booking-ai
npm run dev
```
Đợi server chạy ở http://localhost:3000

### 2. Mở sẵn các tab trình duyệt

**Tab 1: Trang chủ (Khách hàng)**
```
http://localhost:3000
```

**Tab 2: AI Assistant**
```
http://localhost:3000/ai-assistant
```

**Tab 3: Đăng ký Partner**
```
http://localhost:3000/become-partner
```

**Tab 4: Admin Dashboard**
```
http://localhost:3000/admin
```

**Tab 5: Admin Bookings**
```
http://localhost:3000/admin/bookings
```

**Tab 6: Admin Partner Applications**
```
http://localhost:3000/admin/partner-apps
```

**Tab 7: Admin Test Webhook**
```
http://localhost:3000/admin/test-webhook
```

**Tab 8: Admin Email Preview**
```
http://localhost:3000/admin/email-preview
```

**Tab 9: Admin Hotels**
```
http://localhost:3000/admin/hotels
```

**Tab 10: Database Viewer**

**Cách 1: Dùng script Node.js** (Đơn giản nhất)
```
Chạy: node check-pending-bookings.js
Hoặc tạo script mới để xem tables
```

**Cách 2: Prisma Studio** (Nếu không lỗi)
```
Chạy lệnh: npx prisma studio
Mở: http://localhost:5555
```

**Cách 3: Database Client** (Chuyên nghiệp)
- PostgreSQL: pgAdmin, DBeaver
- MySQL: MySQL Workbench
- SQLite: DB Browser for SQLite

### 3. Chuẩn bị tài khoản

**Admin Account**:
- Email: admin@gmail.com
- Password: (xem trong database hoặc reset)

**User Account** (nếu cần):
- Email: user@gmail.com
- Password: (xem trong database)

---

## DEMO THEO TỪNG PHẦN

### DEMO 1: Tìm kiếm khách sạn (3 phút)

**Mở tab**: http://localhost:3000

**Các bước**:
1. Giới thiệu trang chủ
2. Nhập "Đà Lạt" vào ô tìm kiếm
3. Chọn ngày check-in: 10/02/2026
4. Chọn ngày check-out: 12/02/2026
5. Chọn số khách: 2
6. Bấm "Tìm kiếm"
7. Hiển thị kết quả
8. Demo filter giá: 500k - 1M
9. Click vào 1 khách sạn xem chi tiết

**Điểm nhấn**:
- Giao diện đẹp, responsive
- Tìm kiếm nhanh
- Filter real-time
- Hiển thị đầy đủ thông tin

---

### DEMO 2: Đặt phòng với Voucher (4 phút)

**Mở tab**: Từ trang hotel detail

**Các bước**:
1. Chọn phòng "Deluxe Room"
2. Bấm "Đặt phòng"
3. Điền thông tin:
   - Tên: Nguyễn Văn A
   - SĐT: 0901234567
4. Bấm "Xem voucher khả dụng"
5. Chọn voucher SUMMER10
6. Xem giá giảm: 1,000,000đ → 900,000đ
7. Chọn "Thanh toán ngay"
8. Bấm "Xác nhận"
9. Hiển thị trang QR thanh toán

**Điểm nhấn**:
- Voucher tự động filter theo điều kiện
- Tính giá real-time
- 2 phương thức thanh toán
- QR code để thanh toán

---

### DEMO 3: Webhook tự động (3 phút)

**Mở tab**: http://localhost:3000/admin/test-webhook

**Chuẩn bị**: Vào /admin/bookings trước, copy mã booking

**Các bước**:
1. Giải thích webhook là gì
2. Paste mã booking (VD: MEPLCV)
3. Để trống số tiền
4. Bấm "Test Webhook"
5. Hiển thị kết quả thành công
6. Chuyển sang tab /admin/bookings
7. Refresh, thấy booking đã CONFIRMED
8. Mở terminal, show log webhook

**Điểm nhấn**:
- Tự động confirm trong 5 giây
- Không cần admin thủ công
- Tặng điểm thưởng tự động
- Log đầy đủ để audit

---

### DEMO 4: AI Assistant (5 phút)

**Mở tab**: http://localhost:3000/ai-assistant

**Phần A: Tìm kiếm khách sạn (2 phút)**
1. Chat: "Xin chào"
2. Chat: "Tìm khách sạn ở Đà Lạt cho 2 người đi công tác"
3. Đợi AI phân tích và trả lời
4. AI sẽ gợi ý 2 khách sạn phù hợp với business
5. Chat: "Cái đầu tiên có gì đặc biệt?"
6. Chat: "OK, tôi muốn đặt"
7. AI tạo draft booking
8. Giải thích: User cần vào dashboard để confirm

**Phần B: Hủy booking qua AI (3 phút) - MỚI**
1. Chat: "Tôi muốn hủy booking"
2. AI hiển thị danh sách booking có thể hủy (PENDING/CONFIRMED)
3. Chat: Nhập mã booking (6 ký tự cuối, ví dụ: "ABC123")
4. AI kiểm tra policy hủy và hiển thị thông tin hoàn tiền
5. AI yêu cầu xác nhận
6. Chat: "XÁC NHẬN"
7. AI hủy booking thành công
8. Giải thích: Hoàn tiền tự động trong 3-5 ngày

**Điểm nhấn**:
- AI hiểu tiếng Việt tự nhiên
- Phân tích intent (business, leisure, honeymoon, family)
- Match với business tags của hotel
- Tính điểm phù hợp (optimization score)
- Tạo draft booking với reasoning
- **Hủy booking thông minh**: Kiểm tra policy, tính hoàn tiền, yêu cầu xác nhận
- **Chưa tự động đặt hoàn toàn** (cần user confirm)

---

### DEMO 5: Partner đăng ký (5 phút)

**Mở tab 1**: http://localhost:3000/become-partner
**Mở tab 2**: http://localhost:3000/admin/partner-apps
**Mở tab 3**: http://localhost:3000/admin/email-preview

**Các bước**:
1. **Tab 1**: Giới thiệu trang đăng ký
2. Điền form:
   - Họ tên: Nguyễn Văn B
   - Email: partner@example.com
   - SĐT: 0912345678
   - Khách sạn: Mường Thanh
   - Thành phố: Đà Lạt
   - Số phòng: 50
3. Bấm "Gửi đơn"
4. **Tab 2**: Chuyển sang admin portal
5. Thấy đơn mới, status PENDING
6. Bấm "Duyệt đơn"
7. Thông báo thành công
8. **Tab 3**: Chuyển sang email preview
9. Chọn "Email tài khoản mới"
10. Show email với username + password

**Điểm nhấn**:
- Quy trình tự động hoàn toàn
- Tạo account + password secure
- Email chuyên nghiệp
- Admin chỉ cần 1 click

---

### DEMO 6: Partner quản lý (4 phút)

**Mở tab**: http://localhost:3000/admin/hotels

**Chuẩn bị**: Đăng nhập bằng account partner

**Các bước**:
1. Bấm "Thêm khách sạn"
2. Điền thông tin:
   - Tên: Mường Thanh Luxury
   - Thành phố: Đà Lạt
   - Địa chỉ: 123 Trần Phú
   - Upload 5 ảnh
   - Tags: business_friendly, near_airport
3. Bấm "Lưu"
4. Vào trang hotel detail
5. Bấm "Thêm phòng"
6. Điền thông tin phòng:
   - Tên: Deluxe Room
   - Giá: 1,200,000đ
   - Số lượng: 10
   - Upload 3 ảnh (mỗi link 1 dòng)
7. Bấm "Lưu"
8. Phòng hiển thị trong list

**Điểm nhấn**:
- CRUD đầy đủ
- Upload nhiều ảnh
- Business tags cho AI
- Quản lý inventory

---

### DEMO 7: Admin Dashboard (3 phút)

**Mở tab**: http://localhost:3000/admin

**Các bước**:
1. Giới thiệu dashboard
2. Show metrics:
   - Tổng doanh thu
   - Tổng bookings
   - Số khách sạn
   - Số users
3. Show biểu đồ revenue
4. Show top hotels
5. Show recent bookings
6. Click vào 1 booking xem chi tiết

**Điểm nhấn**:
- Nhìn 1 chỗ biết tất cả
- Biểu đồ trực quan
- Real-time data
- Dễ theo dõi kinh doanh

---

### DEMO 8: Database Schema (3 phút)

**Cách demo database** (Chọn 1 trong 3):

**CÁCH 1: Dùng script Node.js** ⭐ Đơn giản nhất

Tạo file `show-database.js`:
```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function showDatabase() {
  console.log('\n📊 DATABASE OVERVIEW\n');
  
  // Count records
  const userCount = await prisma.user.count();
  const hotelCount = await prisma.hotel.count();
  const bookingCount = await prisma.booking.count();
  const voucherCount = await prisma.voucher.count();
  
  console.log('📈 Statistics:');
  console.log(`- Users: ${userCount}`);
  console.log(`- Hotels: ${hotelCount}`);
  console.log(`- Bookings: ${bookingCount}`);
  console.log(`- Vouchers: ${voucherCount}`);
  
  // Show sample data
  console.log('\n👥 Sample Users:');
  const users = await prisma.user.findMany({ take: 3 });
  users.forEach(u => console.log(`  - ${u.name} (${u.email}) - Role: ${u.role}`));
  
  console.log('\n🏨 Sample Hotels:');
  const hotels = await prisma.hotel.findMany({ take: 3 });
  hotels.forEach(h => console.log(`  - ${h.name} (${h.city}) - Rating: ${h.rating}`));
  
  console.log('\n📋 Recent Bookings:');
  const bookings = await prisma.booking.findMany({ 
    take: 3,
    orderBy: { createdAt: 'desc' },
    include: { user: true, hotel: true }
  });
  bookings.forEach(b => console.log(`  - ${b.user.name} → ${b.hotel.name} - ${b.status}`));
  
  await prisma.$disconnect();
}

showDatabase();
```

Chạy: `node show-database.js`

**CÁCH 2: Prisma Studio** (Nếu không lỗi)

```bash
npx prisma studio
```
Mở http://localhost:5555

**CÁCH 3: Database Client GUI**
- PostgreSQL: Dùng pgAdmin hoặc DBeaver
- MySQL: Dùng MySQL Workbench  
- SQLite: Dùng DB Browser for SQLite

**Các bước demo**:

**Nếu dùng script `show-database.js`**:
1. Chạy: `node show-database.js`
2. Giải thích output:
   - Statistics: Tổng số records
   - Users by role: Phân bố quyền
   - Sample data: Users, Hotels, Bookings
   - Bookings by status: Trạng thái đơn
   - Vouchers: Mã giảm giá đang hoạt động
   - AI Features: Tính năng AI đang dùng

**Nếu dùng Prisma Studio**:
1. Giới thiệu Prisma Studio
2. Show danh sách tables (40+ tables)
3. Click vào table **User**:
   - Show các fields: id, email, name, role, points
   - Show data mẫu
   - Giải thích role: USER, PARTNER, ADMIN, SUPER_ADMIN
4. Click vào table **Hotel**:
   - Show fields: name, city, address, images, rating
   - Show businessTags (dùng cho AI)
5. Click vào table **Booking**:
   - Show fields: userId, hotelId, roomId, status
   - Show relationship với User, Hotel, Room
   - Giải thích status: PENDING, CONFIRMED, CANCELLED
6. Click vào table **Payment**:
   - Show relationship 1-1 với Booking
   - Show status: PENDING, PAID
7. Click vào table **Voucher**:
   - Show type: PERCENT, AMOUNT
   - Show usageLimit và usedCount
8. Click vào table **BehaviorPattern** (AI):
   - Show favoriteDestinations (JSON)
   - Show avgPricePerNight, priceSensitivity
9. Click vào table **RoomHold** (AI):
   - Show expiresAt
   - Giải thích auto-hold 15 phút

**Điểm nhấn**:
- 40+ tables được tổ chức tốt
- Relationships rõ ràng (1-1, 1-N, N-N)
- Data có cấu trúc
- Dễ query và maintain
- Prisma Studio giúp xem data trực quan

---

### DEMO 9: Database Relationships (2 phút)

**Vẫn trong Prisma Studio**

**Các bước**:
1. Click vào 1 **Booking** record
2. Bấm vào **userId** → Nhảy sang User
3. Quay lại, bấm vào **hotelId** → Nhảy sang Hotel
4. Quay lại, bấm vào **roomId** → Nhảy sang Room
5. Quay lại, bấm vào **voucherId** → Nhảy sang Voucher
6. Show relationship graph (nếu có)

**Giải thích relationships**:
```
User (1) ──→ (N) Bookings
  ↓
  └──→ (1) UserProfile
  └──→ (1) BehaviorPattern
  └──→ (N) RoomHolds

Hotel (1) ──→ (N) Rooms
  ↓
  └──→ (N) Bookings

Booking (1) ──→ (1) Payment
  ↓
  ├──→ (1) User
  ├──→ (1) Hotel
  ├──→ (1) Room
  └──→ (1) Voucher (optional)

User (N) ←──→ (N) Vouchers (many-to-many)
```

**Điểm nhấn**:
- Relationships được thiết kế chuẩn
- Foreign keys đảm bảo data integrity
- Cascade delete khi cần
- Dễ join và query

---

## THỨ TỰ DEMO ĐỀ XUẤT (35 phút)

### Phần 1: Giới thiệu (2 phút)
- Giới thiệu dự án
- Mục tiêu
- Công nghệ

### Phần 2: Demo Khách hàng (10 phút)
1. Tìm kiếm khách sạn (3 phút)
2. Đặt phòng với voucher (4 phút)
3. AI Assistant (3 phút)

### Phần 3: Demo Thanh toán (3 phút)
4. Webhook tự động confirm (3 phút)

### Phần 4: Demo Partner (9 phút)
5. Đăng ký partner (5 phút)
6. Quản lý khách sạn (4 phút)

### Phần 5: Demo Admin (3 phút)
7. Dashboard (3 phút)

### Phần 6: Demo Database (5 phút)
8. Database Schema (3 phút)
9. Database Relationships (2 phút)

### Phần 7: Kết luận (3 phút)
- Tổng kết tính năng
- Kết quả đạt được
- Q&A

---

## TIPS KHI DEMO

### Trước khi demo
- ✅ Test tất cả tính năng trước
- ✅ Chuẩn bị data mẫu
- ✅ Mở sẵn tất cả tabs
- ✅ Clear cache browser
- ✅ Zoom browser 100%
- ✅ Tắt notifications
- ✅ Chuẩn bị backup plan nếu lỗi

### Trong khi demo
- ✅ Nói chậm, rõ ràng
- ✅ Giải thích từng bước
- ✅ Nhấn mạnh điểm nổi bật
- ✅ Tương tác với audience
- ✅ Để ý thời gian
- ✅ Sẵn sàng trả lời câu hỏi

### Nếu gặp lỗi
- ✅ Giữ bình tĩnh
- ✅ Giải thích lỗi (nếu biết)
- ✅ Chuyển sang demo khác
- ✅ Quay lại sau nếu fix được

---

## CHECKLIST TRƯỚC DEMO

### Server
- [ ] Server đang chạy
- [ ] Database có data
- [ ] Không có lỗi trong terminal

### Browser
- [ ] Đã mở 9 tabs
- [ ] Đã đăng nhập admin
- [ ] Zoom 100%
- [ ] Tắt extensions không cần

### Prisma Studio
- [ ] Đã chạy `npx prisma studio`
- [ ] Mở http://localhost:5555
- [ ] Database có data đầy đủ

### Data
- [ ] Có khách sạn mẫu
- [ ] Có booking mẫu
- [ ] Có voucher mẫu
- [ ] Có partner application mẫu

### Backup
- [ ] Có video demo (nếu lỗi)
- [ ] Có screenshots
- [ ] Có data backup

---

## CÂU HỎI THƯỜNG GẶP

**Q: "Tại sao chọn Next.js?"**
A: "Next.js giúp trang web load nhanh hơn nhờ render trên server, tốt cho SEO, và có nhiều tính năng tối ưu sẵn."

**Q: "AI có thể tự động đặt phòng không?"**
A: "Có, nhưng cần user cho phép và đặt giới hạn số tiền. Mọi hành động đều được log để kiểm tra."

**Q: "Webhook có an toàn không?"**
A: "Có, chúng tôi kiểm tra chữ ký từ ngân hàng, không xử lý trùng, và validate số tiền."

**Q: "Hệ thống có scale được không?"**
A: "Có, database có thể mở rộng, đã tối ưu queries, và có thể thêm cache Redis khi cần."

**Q: "Bao lâu để phát triển?"**
A: "Khoảng 2-3 tháng với team 2-3 người."

**Q: "Database có bao nhiêu bảng?"**
A: "Hơn 40 bảng, chia 3 nhóm: Core (User, Hotel, Booking), Business (Voucher, Policy), và AI (BehaviorPattern, RoomHold)."

**Q: "Tại sao dùng PostgreSQL?"**
A: "PostgreSQL đảm bảo dữ liệu không bị mất (ACID), hỗ trợ JSON, full-text search, và có thể scale tốt."

---

## DEMO DATABASE CHI TIẾT

### Cách mở Prisma Studio

**Terminal 1** (Server):
```bash
cd hotel-booking-ai
npm run dev
```

**Terminal 2** (Prisma Studio):
```bash
cd hotel-booking-ai
npx prisma studio
```

Prisma Studio sẽ mở tại: http://localhost:5555

### Tables quan trọng cần show

**1. User** - Người dùng
- Xem roles: USER, PARTNER, ADMIN, SUPER_ADMIN
- Xem points (loyalty)
- Xem relationships với Bookings

**2. Hotel** - Khách sạn
- Xem businessTags (array)
- Xem images (array)
- Xem rating
- Click vào ownerId → Nhảy sang User

**3. Room** - Phòng
- Xem images (array)
- Xem amenities (array)
- Xem price, capacity, quantity
- Click vào hotelId → Nhảy sang Hotel

**4. Booking** - Đặt phòng
- Xem status flow: PENDING → CONFIRMED
- Xem totalPrice, discount
- Xem relationships: User, Hotel, Room, Voucher, Payment

**5. Payment** - Thanh toán
- Relationship 1-1 với Booking
- Xem status: PENDING → PAID
- Xem method: BANK_TRANSFER, CARD

**6. Voucher** - Mã giảm giá
- Xem type: PERCENT, AMOUNT
- Xem usageLimit vs usedCount
- Xem minSpend, endDate

**7. BehaviorPattern** - AI học hành vi
- Xem favoriteDestinations (JSON array)
- Xem avgPricePerNight
- Xem priceSensitivity (0-1)

**8. RoomHold** - AI giữ phòng
- Xem expiresAt (15 phút)
- Xem status: active, expired, converted

**9. PriceWatch** - Theo dõi giá
- Xem targetPrice
- Xem lastKnownPrice
- Xem alertsSent

**10. DraftBooking** - AI chuẩn bị booking
- Xem reasoning (AI giải thích)
- Xem optimizationScore (0-1)
- Xem status: PREPARED, CONFIRMED

### Giải thích Schema Design

**Tại sao tách Booking và Payment?**
- 1 Booking có thể có nhiều Payment attempts
- Payment có thể fail, retry, refund
- Dễ track payment history

**Tại sao có BehaviorPattern?**
- AI học từ hành vi user
- Personalize recommendations
- Predict preferences

**Tại sao có RoomHold?**
- Giữ phòng tạm khi user đang xem
- Tránh mất phòng khi đang quyết định
- Auto-release sau 15 phút

**Tại sao có DraftBooking?**
- AI chuẩn bị trước
- User chỉ cần approve
- Có reasoning để user hiểu

### Tips khi demo database

✅ **Nên làm**:
- Giải thích từng table rõ ràng
- Show relationships bằng cách click vào foreign keys
- Highlight các fields quan trọng
- Giải thích tại sao thiết kế như vậy
- Show data thật, không fake

❌ **Không nên**:
- Scroll quá nhanh
- Bỏ qua giải thích relationships
- Chỉ show table không giải thích
- Quên đóng Prisma Studio sau demo (tốn RAM)

