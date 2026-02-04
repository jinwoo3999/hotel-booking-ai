const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function seedRealData() {
  console.log('🌱 Đang tạo dữ liệu thực tế...');

  try {
    // Xóa dữ liệu cũ
    await prisma.aiConversation.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.roomInventory.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.flightBooking.deleteMany();
    await prisma.room.deleteMany();
    await prisma.voucher.deleteMany();
    await prisma.hotel.deleteMany();
    await prisma.flight.deleteMany();
    await prisma.attraction.deleteMany();
    await prisma.blogPost.deleteMany();
    await prisma.user.deleteMany();

    const passwordHash = await hash('password', 10);

    // 1. TẠO USERS
    const admin = await prisma.user.create({
      data: { 
        email: 'admin@gmail.com', 
        name: 'Super Admin', 
        role: 'SUPER_ADMIN', 
        password: passwordHash, 
        emailVerified: new Date() 
      }
    });

    const partner = await prisma.user.create({
      data: { 
        email: 'partner@gmail.com', 
        name: 'Partner A', 
        role: 'PARTNER', 
        password: passwordHash, 
        emailVerified: new Date() 
      }
    });

    const user = await prisma.user.create({
      data: { 
        email: 'user@gmail.com', 
        name: 'Khách VIP', 
        role: 'USER', 
        password: passwordHash, 
        points: 500, 
        emailVerified: new Date() 
      }
    });

    // 2. TẠO KHÁCH SẠN THỰC TẾ
    const hotelDaLat = await prisma.hotel.create({
      data: {
        name: 'Lumina Đà Lạt Resort',
        city: 'Đà Lạt',
        address: 'Hồ Tuyền Lâm, Phường 3, Đà Lạt',
        description: 'Khu nghỉ dưỡng đẳng cấp giữa rừng thông với view hồ tuyệt đẹp',
        rating: 4.8,
        status: 'ACTIVE',
        ownerId: partner.id,
        latitude: 11.940419,
        longitude: 108.458313,
        businessTags: ['honeymoon_ready', 'romantic', 'luxury', 'quiet_zone', 'tourist_friendly'],
        images: ['https://images.unsplash.com/photo-1544885935-98dd03d09034?q=80&w=1000'],
        rooms: {
          create: [
            {
              name: 'Deluxe Forest View',
              price: 2500000,
              description: 'Phòng deluxe view rừng thông với ban công riêng',
              quantity: 5,
              capacity: 2,
              maxGuests: 2,
              amenities: ['Wifi miễn phí', 'Minibar', 'Ban công view rừng', 'TV 43 inch'],
              images: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1000']
            },
            {
              name: 'Lake Suite Premium',
              price: 4500000,
              description: 'Suite cao cấp view hồ với phòng khách riêng',
              quantity: 3,
              capacity: 4,
              maxGuests: 4,
              amenities: ['Wifi miễn phí', 'Bồn tắm jacuzzi', 'Ăn sáng miễn phí', 'View hồ'],
              images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000']
            }
          ]
        }
      }
    });

    const hotelHaNoi = await prisma.hotel.create({
      data: {
        name: 'Lumina Grand Hà Nội',
        city: 'Hà Nội',
        address: '123 Phố Huế, Hai Bà Trưng, Hà Nội',
        description: 'Khách sạn 5 sao ngay trung tâm Hà Nội, gần Hồ Gươm',
        rating: 4.5,
        status: 'ACTIVE',
        ownerId: partner.id,
        latitude: 21.028511,
        longitude: 105.804817,
        businessTags: ['business_friendly', 'city_center', 'fast_checkin', 'luxury'],
        images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000'],
        rooms: {
          create: [
            {
              name: 'Superior City View',
              price: 1800000,
              description: 'Phòng superior view thành phố với nội thất hiện đại',
              quantity: 10,
              capacity: 2,
              maxGuests: 2,
              amenities: ['Wifi miễn phí', 'TV thông minh', 'Máy lạnh', 'Tủ lạnh mini'],
              images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=1000']
            },
            {
              name: 'Executive Suite',
              price: 3200000,
              description: 'Suite executive với phòng làm việc và view panorama',
              quantity: 5,
              capacity: 3,
              maxGuests: 3,
              amenities: ['Wifi miễn phí', 'Phòng làm việc', 'Ăn sáng executive', 'Butler service'],
              images: ['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1000']
            }
          ]
        }
      }
    });

    const hotelDaLat2 = await prisma.hotel.create({
      data: {
        name: 'Terracotta Hotel & Resort Đà Lạt',
        city: 'Đà Lạt',
        address: 'Khu Phố 3, Phường 3, Đà Lạt',
        description: 'Resort phong cách Địa Trung Hải với kiến trúc độc đáo',
        rating: 4.6,
        status: 'ACTIVE',
        ownerId: partner.id,
        latitude: 11.945419,
        longitude: 108.442313,
        businessTags: ['honeymoon_ready', 'romantic', 'luxury', 'family_safe', 'spacious'],
        images: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1000'],
        rooms: {
          create: [
            {
              name: 'Terracotta Deluxe',
              price: 2200000,
              description: 'Phòng deluxe phong cách Địa Trung Hải với sân vườn riêng',
              quantity: 8,
              capacity: 2,
              maxGuests: 3,
              amenities: ['Wifi miễn phí', 'Sân vườn riêng', 'Bồn tắm', 'Minibar'],
              images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1000']
            },
            {
              name: 'Family Villa',
              price: 5500000,
              description: 'Villa gia đình 2 phòng ngủ với bếp và phòng khách rộng',
              quantity: 4,
              capacity: 6,
              maxGuests: 6,
              amenities: ['Wifi miễn phí', 'Bếp riêng', '2 phòng ngủ', 'Sân vườn BBQ'],
              images: ['https://images.unsplash.com/photo-1602002418082-a4443e081dd1?q=80&w=1000']
            }
          ]
        }
      }
    });

    const hotelHaNoi2 = await prisma.hotel.create({
      data: {
        name: 'Hanoi Business Hub',
        city: 'Hà Nội',
        address: '45 Láng Hạ, Đống Đa, Hà Nội',
        description: 'Khách sạn chuyên phục vụ khách công tác với phòng họp hiện đại',
        rating: 4.3,
        status: 'ACTIVE',
        ownerId: partner.id,
        latitude: 21.018511,
        longitude: 105.814817,
        businessTags: ['business_friendly', 'fast_checkin', 'near_airport', 'city_center'],
        images: ['https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=1000'],
        rooms: {
          create: [
            {
              name: 'Business Standard',
              price: 1200000,
              description: 'Phòng tiêu chuẩn với bàn làm việc rộng và wifi tốc độ cao',
              quantity: 15,
              capacity: 1,
              maxGuests: 2,
              amenities: ['Wifi tốc độ cao', 'Bàn làm việc', 'Ăn sáng buffet', 'Máy in miễn phí'],
              images: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1000']
            },
            {
              name: 'Business Suite',
              price: 2400000,
              description: 'Suite với phòng họp nhỏ và không gian làm việc riêng',
              quantity: 6,
              capacity: 2,
              maxGuests: 2,
              amenities: ['Wifi tốc độ cao', 'Phòng họp nhỏ', 'Máy chiếu', 'Coffee maker'],
              images: ['https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=1000']
            }
          ]
        }
      }
    });

    // 3. TẠO VOUCHER THỰC TẾ
    await prisma.voucher.createMany({
      data: [
        {
          code: 'LUMINA1M',
          discount: 1000000,
          type: 'AMOUNT',
          description: 'Voucher chào mừng thành viên mới - Giảm 1 triệu đồng',
          minSpend: 3000000,
          endDate: new Date('2026-12-31'),
          usageLimit: 100,
          usedCount: 0
        },
        {
          code: 'WELCOME2026',
          discount: 15,
          type: 'PERCENT',
          description: 'Giảm 15% tối đa 500k cho đơn hàng đầu tiên',
          minSpend: 1000000,
          endDate: new Date('2026-12-31'),
          usageLimit: 200,
          usedCount: 0
        },
        {
          code: 'DALAT50',
          discount: 500000,
          type: 'AMOUNT',
          description: 'Ưu đãi đặc biệt cho khách sạn Đà Lạt',
          minSpend: 2000000,
          endDate: new Date('2026-06-30'),
          usageLimit: 50,
          usedCount: 0
        },
        {
          code: 'BUSINESS20',
          discount: 20,
          type: 'PERCENT',
          description: 'Giảm 20% cho khách công tác',
          minSpend: 1500000,
          endDate: new Date('2026-12-31'),
          usageLimit: 150,
          usedCount: 0
        },
        {
          code: 'FAMILY800',
          discount: 800000,
          type: 'AMOUNT',
          description: 'Ưu đãi gia đình - Giảm 800k cho đơn từ 4 triệu',
          minSpend: 4000000,
          endDate: new Date('2026-12-31'),
          usageLimit: 80,
          usedCount: 0
        }
      ]
    });

    // 4. TẠO ĐIỂM VUI CHƠI
    await prisma.attraction.createMany({
      data: [
        {
          name: 'Thung Lũng Tình Yêu',
          city: 'Đà Lạt',
          address: 'Phường 8, TP. Đà Lạt',
          category: 'Tham quan',
          description: 'Khu du lịch nổi tiếng với cảnh quan lãng mạn và các hoạt động vui chơi',
          images: ['https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1200'],
          status: 'PUBLISHED'
        },
        {
          name: 'Đồi Chè Cầu Đất',
          city: 'Đà Lạt',
          address: 'Xuân Trường, TP. Đà Lạt',
          category: 'Thiên nhiên',
          description: 'Địa điểm săn mây và tham quan đồi chè nổi tiếng',
          images: ['https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200'],
          status: 'PUBLISHED'
        },
        {
          name: 'Hồ Gươm',
          city: 'Hà Nội',
          address: 'Quận Hoàn Kiếm, Hà Nội',
          category: 'Tham quan',
          description: 'Biểu tượng của thủ đô Hà Nội với tháp Rùa và đền Ngọc Sơn',
          images: ['https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=1200'],
          status: 'PUBLISHED'
        },
        {
          name: 'Văn Miếu',
          city: 'Hà Nội',
          address: '58 Quốc Tử Giám, Đống Đa, Hà Nội',
          category: 'Lịch sử',
          description: 'Trường đại học đầu tiên của Việt Nam, nơi thờ Khổng Tử',
          images: ['https://images.unsplash.com/photo-1555400082-8dd4d78c670b?q=80&w=1200'],
          status: 'PUBLISHED'
        }
      ]
    });

    // 5. TẠO VÉ MÁY BAY
    await prisma.flight.create({
      data: {
        airline: 'Vietnam Airlines',
        flightNumber: 'VN1234',
        fromCity: 'Hà Nội',
        toCity: 'Đà Lạt',
        departureTime: new Date('2026-03-15T08:30:00'),
        arrivalTime: new Date('2026-03-15T10:30:00'),
        price: 1500000
      }
    });

    // 6. CÀI ĐẶT
    await prisma.settings.upsert({
      where: { id: 'config' },
      update: {
        siteName: 'Lumina Stay',
        contactEmail: 'support@luminastay.com',
        maintenanceMode: false
      },
      create: {
        id: 'config',
        siteName: 'Lumina Stay',
        contactEmail: 'support@luminastay.com',
        maintenanceMode: false
      }
    });

    // 7. CHÍNH SÁCH
    await prisma.policy.upsert({
      where: { id: 'default' },
      update: {
        checkInTime: '14:00',
        checkOutTime: '12:00',
        cancellationDeadlineHours: 24,
        refundPercent: 100,
        refundPolicyText: 'Hủy miễn phí trước 24 giờ so với giờ check-in. Hủy trong vòng 24 giờ có thể không được hoàn tiền tùy theo chính sách từng khách sạn.',
        serviceFeePercent: 0,
        taxPercent: 0
      },
      create: {
        id: 'default',
        checkInTime: '14:00',
        checkOutTime: '12:00',
        cancellationDeadlineHours: 24,
        refundPercent: 100,
        refundPolicyText: 'Hủy miễn phí trước 24 giờ so với giờ check-in. Hủy trong vòng 24 giờ có thể không được hoàn tiền tùy theo chính sách từng khách sạn.',
        serviceFeePercent: 0,
        taxPercent: 0
      }
    });

    // 8. TẠO BLOG POSTS
    await prisma.blogPost.createMany({
      data: [
        {
          title: 'Hồ Xuân Hương Đà Lạt – "Nàng thơ kiều diễm" giữa lòng thành phố',
          slug: 'ho-xuan-huong-da-lat-nang-tho-kieu-diem-giua-long-thanh-pho',
          excerpt: 'Khám phá vẻ đẹp thơ mộng của Hồ Xuân Hương - biểu tượng của thành phố Đà Lạt với những câu chuyện lãng mạn và cảnh quan tuyệt đẹp.',
          content: `Hồ Xuân Hương là một trong những địa điểm du lịch nổi tiếng nhất tại Đà Lạt, được mệnh danh là "trái tim" của thành phố ngàn hoa. Với vẻ đẹp thơ mộng và lãng mạn, hồ Xuân Hương đã trở thành biểu tượng không thể thiếu trong hành trình khám phá Đà Lạt.

**Lịch sử và tên gọi**

Hồ Xuân Hương được đặt theo tên của nữ thi sĩ tài ba Hồ Xuân Hương - một trong những nhân vật văn học nổi tiếng của Việt Nam. Hồ có diện tích khoảng 25 hecta, được hình thành từ năm 1919 khi người Pháp xây dựng đập Cam Ly để tạo ra nguồn nước cho thành phố.

**Vẻ đẹp quyến rũ**

Hồ Xuân Hương sở hữu vẻ đẹp thanh bình với mặt nước trong xanh như gương, phản chiếu những dãy núi xanh mướt và những ngôi nhà xinh xắn xung quanh. Vào buổi sáng sớm, khi sương mù còn bao phủ mặt hồ, khung cảnh trở nên huyền ảo và thơ mộng đến lạ kỳ.

**Hoạt động du lịch**

- **Đi bộ quanh hồ**: Con đường bao quanh hồ dài khoảng 7km, rất thích hợp cho việc đi bộ, chạy bộ hoặc đạp xe
- **Du thuyền**: Thuê thuyền pedal hoặc thuyền máy để ngắm cảnh từ trên mặt hồ
- **Chụp ảnh**: Nhiều góc chụp đẹp, đặc biệt là khu vực gần cầu Ánh Sáng
- **Thưởng thức ẩm thực**: Nhiều quán cà phê và nhà hàng view hồ xung quanh

**Thời điểm lý tưởng**

Hồ Xuân Hương đẹp vào mọi thời điểm trong ngày, nhưng đặc biệt quyến rũ vào:
- Buổi sáng sớm (6-8h): Sương mù, không khí trong lành
- Buổi chiều tà (16-18h): Ánh nắng vàng, không khí mát mẻ
- Buổi tối: Đèn đường lung linh, phản chiếu trên mặt nước

Hồ Xuân Hương không chỉ là điểm đến du lịch mà còn là nơi lưu giữ những kỷ niệm đẹp của biết bao cặp đôi yêu nhau. Đây thực sự là một "nàng thơ kiều diễm" giữa lòng thành phố Đà Lạt.`,
          coverImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1200',
          status: 'PUBLISHED',
          authorId: admin.id
        },
        {
          title: '5 Mẹo Chọn Khách Sạn Đà Lạt Giá Tốt Cho Kỳ Nghỉ Hoàn Hảo',
          slug: '5-meo-chon-khach-san-da-lat-gia-tot-cho-ky-nghi-hoan-hao',
          excerpt: 'Chia sẻ những bí quyết chọn khách sạn Đà Lạt với giá cả hợp lý nhưng vẫn đảm bảo chất lượng dịch vụ tốt nhất.',
          content: `Đà Lạt là điểm đến yêu thích của nhiều du khách với khí hậu mát mẻ quanh năm và cảnh quan thơ mộng. Để có một kỳ nghỉ trọn vẹn mà không lo về chi phí, việc chọn khách sạn phù hợp là rất quan trọng.

**1. Đặt phòng trước 2-3 tuần**

Đặt phòng sớm giúp bạn có nhiều lựa chọn hơn và thường được giá tốt hơn. Các khách sạn thường có chính sách giảm giá cho booking sớm.

**2. Tránh các dịp lễ tết và cuối tuần**

Giá phòng thường tăng 30-50% vào cuối tuần và các ngày lễ. Nếu có thể, hãy chọn đi vào các ngày thường để tiết kiệm chi phí.

**3. So sánh nhiều nền tảng đặt phòng**

Không chỉ dựa vào một website, hãy so sánh giá trên nhiều nền tảng khác nhau để tìm được deal tốt nhất.

**4. Chọn vị trí phù hợp**

- **Trung tâm thành phố**: Tiện di chuyển nhưng giá cao hơn
- **Ngoại ô**: Giá rẻ hơn, cảnh quan đẹp nhưng cần phương tiện di chuyển

**5. Sử dụng voucher và khuyến mãi**

Theo dõi các chương trình khuyến mãi, voucher giảm giá để tiết kiệm chi phí. Lumina Stay hiện có các voucher:
- LUMINA1M: Giảm 1 triệu cho đơn từ 3 triệu
- WELCOME2026: Giảm 15% tối đa 500k
- DALAT50: Giảm 500k cho khách sạn Đà Lạt

**Lưu ý khi chọn khách sạn:**

- Đọc kỹ review từ khách hàng trước đó
- Kiểm tra các tiện ích đi kèm (wifi, bữa sáng, bãi đậu xe)
- Xác nhận chính sách hủy phòng
- Liên hệ trực tiếp khách sạn để có giá tốt hơn

Với những mẹo trên, bạn sẽ tìm được khách sạn Đà Lạt vừa ý với mức giá hợp lý cho chuyến du lịch của mình!`,
          coverImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200',
          status: 'PUBLISHED',
          authorId: partner.id
        }
      ]
    });

    console.log('✅ Đã tạo dữ liệu thực tế thành công!');
    console.log('📊 Thống kê:');
    console.log('- 4 khách sạn (2 Đà Lạt + 2 Hà Nội)');
    console.log('- 8 loại phòng');
    console.log('- 5 voucher giảm giá');
    console.log('- 4 điểm vui chơi');
    console.log('- 3 tài khoản user');

  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedRealData();