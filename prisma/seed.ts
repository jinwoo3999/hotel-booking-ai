import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🗑️ Đang dọn dẹp dữ liệu cũ...');
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.voucher.deleteMany();
  await prisma.room.deleteMany();

  console.log('🌱 Đang tạo dữ liệu mới...');

  // 1. TẠO VOUCHER 
  await prisma.voucher.createMany({
    data: [
      {
        code: "WELCOME2026",
        description: "Giảm ngay 200k cho khách hàng mới",
        discount: 200000,
        type: "FIXED", // Giảm tiền mặt
        minSpend: 1000000,
        expiryDate: new Date('2026-12-31'), 
      },
      {
        code: "SUMMER10",
        description: "Giảm 10% tối đa 500k mùa hè này",
        discount: 10,
        type: "PERCENT", // Giảm phần trăm
        minSpend: 2000000,
        expiryDate: new Date('2026-08-30'),
      }
    ]
  });
  console.log('✅ Đã tạo 2 Voucher.');

  // 2. TẠO PHÒNG 
  await prisma.room.createMany({
    data: [
      {
        name: "Lumina Royal Suite",
        description: "Phòng hạng sang cao cấp nhất với tầm nhìn toàn cảnh biển Mỹ Khê. Thiết kế phong cách Indochine.",
        pricePerNight: 2500000,
        capacity: 4,
        amenities: ["Wifi 6E", "Bồn tắm Jacuzzi", "Netflix", "Ăn sáng", "Minibar"],
        images: ["https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1974&auto=format&fit=crop"],
        isFeatured: true,
      },
      {
        name: "Ocean Deluxe King",
        description: "Không gian lãng mạn cho các cặp đôi với ban công riêng hướng biển.",
        pricePerNight: 1200000,
        capacity: 2,
        amenities: ["Wifi", "TV 4K", "Ban công", "Bồn tắm đứng"],
        images: ["https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1925&auto=format&fit=crop"],
        isFeatured: true,
      },
      {
        name: "Family Garden Villa",
        description: "Biệt thự sân vườn biệt lập, phù hợp cho gia đình có trẻ nhỏ.",
        pricePerNight: 3500000,
        capacity: 6,
        amenities: ["Bếp riêng", "Hồ bơi riêng", "Sân nướng BBQ"],
        images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop"],
        isFeatured: false,
      },
      {
        name: "Smart Studio City View",
        description: "Phòng thông minh điều khiển bằng giọng nói, view thành phố năng động.",
        pricePerNight: 850000,
        capacity: 2,
        amenities: ["Alexa Home", "Rèm tự động", "Loa Marshall"],
        images: ["https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=2070&auto=format&fit=crop"],
        isFeatured: false,
      },
    ]
  });
  console.log('✅ Đã tạo 4 Phòng.');
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })