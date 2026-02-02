import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

function toDateOnly(d: Date) {
  // Normalize to date-only (00:00:00) to match RoomInventory.date @db.Date semantics.
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

async function main() {
  console.log('🌱 Đang dọn dẹp dữ liệu cũ...')

  // Xóa theo thứ tự để tránh lỗi khóa ngoại
  await prisma.blogPost.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.roomInventory.deleteMany()
  await prisma.policy.deleteMany()
  await prisma.review.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.flightBooking.deleteMany()
  await prisma.room.deleteMany()
  await prisma.voucher.deleteMany() 
  await prisma.hotel.deleteMany()
  await prisma.flight.deleteMany()
  await prisma.account.deleteMany()
  await prisma.session.deleteMany()
  await prisma.settings.deleteMany()
  await prisma.user.deleteMany()

  console.log('🚀 Đang tạo dữ liệu mới...')

  const passwordHash = await hash('password', 10)

  // 1. TẠO USERS
  const partner = await prisma.user.create({
    // PARTNER: hotel owner / partner account (new explicit role)
    data: { email: 'partner@gmail.com', name: 'Partner A', role: 'PARTNER', password: passwordHash, emailVerified: new Date() }
  })
  const user = await prisma.user.create({
    data: { email: 'user@gmail.com', name: 'Khách Vip', role: 'USER', password: passwordHash, points: 500, emailVerified: new Date() }
  })
  await prisma.user.create({
    data: { email: 'admin@gmail.com', name: 'Super Admin', role: 'SUPER_ADMIN', password: passwordHash, emailVerified: new Date() }
  })

  // 2. TẠO HOTELS & ROOMS
  const hotel = await prisma.hotel.create({
    data: {
      name: 'Lumina Đà Lạt Resort',
      city: 'Đà Lạt',
      address: 'Hồ Tuyền Lâm, Phường 3',
      description: 'Khu nghỉ dưỡng đẳng cấp giữa rừng thông.',
      rating: 4.8,
      status: 'ACTIVE',
      ownerId: partner.id,
      images: ['https://images.unsplash.com/photo-1544885935-98dd03d09034?q=80&w=1000'],
      rooms: {
        create: [
            { 
              name: 'Deluxe Forest View', price: 2500000, description: 'View rừng thông', 
              quantity: 5, capacity: 2, maxGuests: 2,
              amenities: ['Wifi', 'Minibar', 'Ban công'], 
              images: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1000']
            },
            { 
              name: 'Lake Suite', price: 4500000, description: 'View hồ trực diện', 
              quantity: 3, capacity: 4, maxGuests: 4,
              amenities: ['Wifi', 'Bồn tắm', 'Ăn sáng'], 
              images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000']
            }
        ]
      }
    }
  })

  // 2.1. TẠO INVENTORY CALENDAR (DB-driven availability)
  // We pre-generate inventory for seeded rooms for the next 365 days so availability checks
  // are immediately usable across the app and the AI assistant.
  const rooms = await prisma.room.findMany({ where: { hotelId: hotel.id } })
  const today = toDateOnly(new Date())
  const daysToGenerate = 365

  for (const room of rooms) {
    const rows = []
    for (let i = 0; i < daysToGenerate; i++) {
      const date = new Date(today)
      date.setUTCDate(date.getUTCDate() + i)
      rows.push({
        roomId: room.id,
        date,
        total: room.quantity,
        booked: 0,
      })
    }
    // createMany with skipDuplicates to allow re-runs during development.
    await prisma.roomInventory.createMany({ data: rows, skipDuplicates: true })
  }

  // 2.2. CHÍNH SÁCH (Policy) cho AI + nghiệp vụ hủy/sửa đặt phòng
  await prisma.policy.create({
    data: {
      id: "default",
      checkInTime: "14:00",
      checkOutTime: "12:00",
      cancellationDeadlineHours: 24,
      refundPercent: 100,
      refundPolicyText:
        "Hủy miễn phí trước 24 giờ so với giờ check-in. Hủy trong vòng 24 giờ có thể không được hoàn tiền (tùy trạng thái thanh toán).",
      // Phí dịch vụ & thuế mặc định = 0 (có thể điều chỉnh sau trong DB).
      serviceFeePercent: 0,
      taxPercent: 0,
    }
  })

  // 3. TẠO VOUCHER (QUAN TRỌNG: VOUCHER 1 TRIỆU)
  await prisma.voucher.createMany({
    data: [
      { 
        code: 'LUMINA1M', 
        discount: 1000000, // Giảm 1 triệu
        type: 'AMOUNT', 
        description: 'Voucher chào mừng thành viên mới', 
        minSpend: 3000000, // Áp dụng cho đơn từ 3tr
        endDate: new Date('2026-12-31') 
      },
      { 
        code: 'WELCOME2026', 
        discount: 15, 
        type: 'PERCENT', 
        description: 'Giảm 15% tối đa 500k', 
        minSpend: 1000000, 
        endDate: new Date('2026-12-31') 
      },
    ]
  })

  // 4. TẠO VÉ MÁY BAY
  await prisma.flight.create({
    data: {
        airline: "Vietnam Airlines", flightNumber: "VN100",
        fromCity: "Hà Nội", toCity: "Đà Lạt",
        departureTime: new Date(new Date().setHours(8, 30)), 
        arrivalTime: new Date(new Date().setHours(10, 30)),
        price: 1500000
    }
  })

  // 5. CÀI ĐẶT
  await prisma.settings.create({
    data: { id: "config", siteName: "Lumina Stay", contactEmail: "admin@luminastay.com" }
  })

  // 6. CẨM NANG (BLOG)
  await prisma.blogPost.create({
    data: {
      title: "5 mẹo chọn phòng view đẹp cho kỳ nghỉ",
      slug: "5-meo-chon-phong-view-dep",
      excerpt: "Tổng hợp các mẹo đơn giản giúp bạn chọn phòng có view đẹp, đúng nhu cầu và tối ưu chi phí.",
      content:
        "1) Xác định nhu cầu view (biển, núi, thành phố)\n" +
        "2) Ưu tiên tầng cao hoặc hướng phù hợp\n" +
        "3) Đọc kỹ mô tả phòng + ảnh thực tế\n" +
        "4) Hỏi khách sạn về vị trí phòng trước khi chốt\n" +
        "5) Đặt sớm để có nhiều lựa chọn\n",
      coverImage: "https://images.unsplash.com/photo-1501117716987-c8e1ecb210d7?q=80&w=1600",
      status: "PUBLISHED",
      authorId: partner.id,
    },
  })

  // 7. ĐIỂM VUI CHƠI (ATTRACTION)
  await prisma.attraction.createMany({
    data: [
      {
        name: "Thung Lũng Tình Yêu",
        city: "Đà Lạt",
        address: "Phường 8, TP. Đà Lạt",
        category: "Tham quan",
        description: "Khu du lịch nổi tiếng với cảnh quan lãng mạn.",
        images: ["https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1200"],
        status: "PUBLISHED",
      },
      {
        name: "Đồi Chè Cầu Đất",
        city: "Đà Lạt",
        address: "Xuân Trường, TP. Đà Lạt",
        category: "Thiên nhiên",
        description: "Địa điểm săn mây và tham quan đồi chè nổi bật.",
        images: ["https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200"],
        status: "PUBLISHED",
      },
      {
        name: "Bà Nà Hills",
        city: "Đà Nẵng",
        address: "Hòa Ninh, Hòa Vang, Đà Nẵng",
        category: "Khu vui chơi",
        description: "Khu du lịch trên núi với Cầu Vàng nổi tiếng.",
        images: ["https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200"],
        status: "PUBLISHED",
      },
    ],
  })

  console.log('✅ Đã tạo Voucher 1 Triệu và dữ liệu mẫu thành công!')
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })