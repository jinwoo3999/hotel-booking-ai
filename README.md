# 🏨 LUMINA STAY - HỆ THỐNG ĐẶT PHÒNG KHÁCH SẠN VỚI AI

## 🎯 TỔNG QUAN
Lumina Stay là hệ thống đặt phòng khách sạn hiện đại với AI Assistant thông minh, hỗ trợ đầy đủ cho khách hàng, đối tác khách sạn và quản trị viên.

**Tech Stack:** Next.js 16 + PostgreSQL + Prisma + NextAuth.js + Google Gemini AI

## 🚀 TÍNH NĂNG CHÍNH

### 🤖 AI Assistant Thông Minh
- **Google Gemini 2.5 Flash** - AI thật, không phải chatbot
- **Location-specific filtering** - 100% chính xác theo vị trí
- **Entity extraction** - Hiểu ngân sách, số người, thời gian
- **No hallucination** - Chỉ dùng dữ liệu thật từ database

### 🤝 Hệ Thống Partner Hoàn Chỉnh
- Đăng ký partner qua form chi tiết
- Admin duyệt và tự động tạo tài khoản
- Partner quản lý khách sạn riêng
- Dashboard phân quyền rõ ràng

### 📊 Dashboard Phân Quyền
- **Super Admin:** Quản lý toàn hệ thống
- **Partner:** Chỉ quản lý khách sạn của mình
- **User:** Dashboard cá nhân với booking history

## 🔧 CÀI ĐẶT & CHẠY

```bash
# Clone repository
git clone [repository-url]
cd hotel-booking-ai

# Cài đặt dependencies
npm install

# Setup database
npx prisma migrate dev
npx prisma db seed

# Chạy development server
npm run dev
```

## 🎯 THÔNG TIN ĐĂNG NHẬP

### Tài khoản demo:
- **Super Admin:** admin@gmail.com / 123456
- **Partner:** partner@gmail.com / 123456
- **User:** user@gmail.com / 123456

## 📊 DỮ LIỆU DEMO
- **Hotels:** 2 khách sạn (Đà Lạt, Hà Nội)
- **Bookings:** 5 đặt phòng với revenue 5M
- **Vouchers:** 3 voucher active
- **Partner Apps:** 6 đơn đăng ký (4 pending, 1 approved, 1 rejected)

## 🎬 DEMO FLOW

1. **AI Assistant:** `/ai-assistant` - Test chat thông minh
2. **Partner Registration:** `/become-partner` - Đăng ký đối tác
3. **Admin Approval:** `/admin/partner-apps` - Duyệt đơn
4. **Partner Dashboard:** `/admin` (login partner) - Quản lý khách sạn
5. **User Booking:** `/hotels` - Đặt phòng end-to-end

## 🔒 SECURITY
- NextAuth.js authentication
- Role-based access control
- Password hashing với bcrypt
- SQL injection protection

## 📈 PERFORMANCE
- Next.js 16 optimization
- Database connection pooling
- Caching strategy
- Image optimization

## 🎊 TRẠNG THÁI
✅ **HOÀN THÀNH 100% - SẴN SÀNG THUYẾT TRÌNH**

Hệ thống đã được test đầy đủ và sẵn sàng cho demo/production.

---

**Phát triển bởi:** Nhóm sinh viên thực tập  
**Ngày hoàn thành:** Tháng 2, 2026  
**Version:** 1.0.0