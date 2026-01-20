🏨 Lumina Stay - Hotel Booking AI
Xin chào thầy và các bạn, đây là source code dự án Website Đặt phòng Khách sạn tích hợp AI - Báo cáo kết thúc học phần Thực tập Tốt nghiệp của nhóm em.

Dự án này tập trung vào việc áp dụng các công nghệ Web hiện đại (Next.js 15, TypeScript) để giải quyết bài toán đặt phòng, thanh toán và quản lý khách hàng thân thiết trong thực tế.

🛠 Công nghệ sử dụng (Tech Stack)
Em sử dụng bộ công nghệ (Tech Stack) mới nhất để đảm bảo hiệu năng và tính mở rộng:

Framework: Next.js 15 (App Router) - Server Component, Server Actions.

Ngôn ngữ: TypeScript.

Database: PostgreSQL + Prisma ORM.

Giao diện: Tailwind CSS + Shadcn UI.

Authentication: NextAuth.js v5.

Payment Integration: VietQR (Mô phỏng thanh toán chuyển khoản).

 Tính năng chính (Key Features)
Các chức năng cốt lõi đã hoàn thiện:

Booking Engine:

Đặt phòng theo ngày hoặc theo giờ (Day Use).

Tự động tính toán giá tiền và kiểm tra phòng trống.

Thanh toán:

Tích hợp popup quét mã QR (VietQR) với nội dung chuyển khoản động.

Xử lý trạng thái đơn hàng Real-time.

Hệ thống Loyalty (Khách hàng thân thiết):

Tự động tích điểm dựa trên chi tiêu thực tế.

Phân hạng thành viên (Mới -> Bạc -> Vàng) và hiển thị thanh tiến độ.

Ví Voucher:

Quản lý mã giảm giá với giao diện thẻ trực quan.

Tự động áp dụng mã khi đủ điều kiện.

Tìm kiếm & Lọc: Tìm kiếm phòng theo từ khóa, tiện nghi với tốc độ cao.

 Cài đặt & Chạy dự án (Installation)
Để chạy dự án ở local, làm theo các bước sau:

Bước 1: Clone source code

Bash
git clone https://github.com/jinwoo3999/hotel-booking-ai.git
cd hotel-booking-ai
Bước 2: Cài đặt thư viện

Bash
npm install
Bước 3: Cấu hình môi trường (.env) Tạo file .env ở thư mục gốc và điền các thông tin kết nối Database/Auth:

Đoạn mã
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
NEXTAUTH_SECRET="your_super_secret_key"
# Các key khác nếu có (Google Client ID, etc.)
Bước 4: Khởi tạo Database Chạy lệnh migration và seed dữ liệu mẫu:

Bash
npx prisma db push
npx tsx prisma/seed.ts
Bước 5: Chạy ứng dụng

Bash
npm run dev
Truy cập: http://localhost:3000

📞 Thông tin liên hệ
Sinh viên thực hiện: 
Lê Ngọc Hân
Nguyễn Thành Danh

GitHub: jinwoo3999

Dự án này là sản phẩm của quá trình thực tập, mọi đóng góp hoặc thắc mắc vui lòng tạo Issue trên GitHub. Xin cảm ơn!