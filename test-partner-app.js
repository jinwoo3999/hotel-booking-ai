const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestApplication() {
  try {
    const app = await prisma.partnerApplication.create({
      data: {
        fullName: "Nguyễn Văn Test",
        email: "test@hotel.com",
        phone: "0987654321",
        hotelName: "Khách sạn Test",
        city: "Hà Nội",
        address: "123 Đường Test, Quận Test",
        roomCount: 50,
        website: "https://test-hotel.com",
        description: "Đây là đơn test",
        experience: "5+",
      }
    });
    
    console.log("✅ Test application created:", app.id);
    console.log("📋 Application details:", app);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestApplication();
