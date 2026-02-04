# 🏨 Lumina Stay - Hệ Thống Đặt Phòng Khách Sạn

Nền tảng đặt phòng khách sạn với AI hỗ trợ tìm kiếm và đặt phòng thông minh.

## 🚀 Tính Năng Chính

### Khách Hàng
- 🤖 **AI Chat** - Tìm và đặt phòng qua chat thông minh
- 🔍 **Tìm kiếm thông minh** - AI xếp hạng khách sạn dựa trên nhu cầu
- 🎫 **Voucher** - Hệ thống mã giảm giá tự động
- 💳 **Thanh toán** - QR Code, Thẻ ngân hàng, Tiền mặt
- 📱 **Responsive** - Hoạt động mượt trên mọi thiết bị

### Admin
- 🏨 **Quản lý khách sạn & phòng**
- 📊 **Dashboard thống kê**
- 👥 **Quản lý người dùng**
- 🎟️ **Quản lý voucher**
- 📝 **Quản lý booking**
- 🤝 **Duyệt đối tác**

## 🛠️ Công Nghệ

- **Framework:** Next.js 16 (App Router)
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth.js
- **UI:** Tailwind CSS + shadcn/ui
- **Language:** TypeScript

## 📦 Cài Đặt

### Yêu Cầu
- Node.js 18+
- PostgreSQL
- npm hoặc yarn

### Các Bước

1. **Clone & Install**
```bash
cd hotel-booking-ai
npm install
```

2. **Cấu hình .env**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/hotel_booking"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

3. **Setup Database**
```bash
npx prisma generate
npx prisma db push
npm run seed
```

4. **Chạy Development**
```bash
npm run dev
```

Mở http://localhost:3000

## 👤 Tài Khoản Demo

### Admin
- Email: `admin@lumina.com`
- Password: `admin123`

### Khách hàng
- Email: `user@example.com`
- Password: `user123`

## 📁 Cấu Trúc Thư Mục

```
hotel-booking-ai/
├── prisma/              # Database schema & migrations
├── public/              # Static files
├── src/
│   ├── app/            # Next.js App Router
│   │   ├── (auth)/    # Auth pages
│   │   ├── admin/     # Admin dashboard
│   │   ├── api/       # API routes
│   │   └── dashboard/ # User dashboard
│   ├── components/     # React components
│   │   ├── ai/        # AI chat components
│   │   ├── admin/     # Admin components
│   │   └── ui/        # shadcn/ui components
│   └── lib/           # Utilities & helpers
│       └── ai/        # AI logic
└── README.md
```

## 🎯 Tính Năng AI

### Smart Search
- Phân tích ngôn ngữ tự nhiên
- Xếp hạng khách sạn theo:
  - Business Tags (40%)
  - Rating (30%)
  - Giá (30%)

### Auto Voucher
- Tự động đề xuất voucher tốt nhất
- Kiểm tra điều kiện áp dụng
- Tính toán giảm giá real-time

### Booking Flow
1. User chat với AI
2. AI hiển thị khách sạn phù hợp
3. Chọn khách sạn → Xem phòng
4. Chọn phòng → Điền thông tin
5. Chọn voucher & thanh toán
6. Redirect đến trang thanh toán

## 🔐 Phân Quyền

- **SUPER_ADMIN** - Toàn quyền
- **ADMIN** - Quản lý hệ thống
- **PARTNER** - Quản lý khách sạn của mình
- **USER** - Đặt phòng

## 📝 Scripts

```bash
npm run dev          # Development server
npm run build        # Build production
npm run start        # Start production
npm run lint         # Lint code
npx prisma studio    # Database GUI
```

## 🐛 Troubleshooting

### Port đã được sử dụng
```bash
# Windows
taskkill /F /PID <process-id>

# Linux/Mac
kill -9 <process-id>
```

### Database connection error
- Kiểm tra PostgreSQL đang chạy
- Kiểm tra DATABASE_URL trong .env
- Chạy `npx prisma generate`

### Build error
```bash
# Xóa cache và rebuild
rm -rf .next node_modules
npm install
npm run build
```

## 📞 Hỗ Trợ

- Email: support@lumina.com
- Hotline: 1900 6789

## 📄 License

MIT License - Tự do sử dụng cho mục đích cá nhân và thương mại.

---

Made with ❤️ by Lumina Team
