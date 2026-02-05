/**
 * Script để admin xem thông tin partner đã được duyệt
 * Sử dụng: node get-partner-credentials.js <email>
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getPartnerInfo() {
  const email = process.argv[2];
  
  if (!email) {
    console.log('❌ Vui lòng cung cấp email');
    console.log('Sử dụng: node get-partner-credentials.js <email>');
    process.exit(1);
  }

  try {
    // Tìm application
    const application = await prisma.partnerApplication.findFirst({
      where: { 
        email: email,
        status: 'APPROVED'
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true
          }
        }
      }
    });

    if (!application) {
      console.log(`❌ Không tìm thấy đơn đã duyệt cho email: ${email}`);
      process.exit(1);
    }

    console.log('\n📋 THÔNG TIN PARTNER');
    console.log('='.repeat(50));
    console.log(`Tên: ${application.fullName}`);
    console.log(`Email: ${application.email}`);
    console.log(`SĐT: ${application.phone}`);
    console.log(`Khách sạn: ${application.hotelName}`);
    console.log(`Thành phố: ${application.city}`);
    console.log(`Địa chỉ: ${application.address}`);
    console.log(`\nTrạng thái đơn: ${application.status}`);
    console.log(`Ngày gửi: ${application.submittedAt.toLocaleString('vi-VN')}`);
    console.log(`Ngày duyệt: ${application.reviewedAt?.toLocaleString('vi-VN') || 'N/A'}`);

    if (application.user) {
      console.log('\n👤 THÔNG TIN TÀI KHOẢN');
      console.log('='.repeat(50));
      console.log(`User ID: ${application.user.id}`);
      console.log(`Email đăng nhập: ${application.user.email}`);
      console.log(`Tên: ${application.user.name}`);
      console.log(`Role: ${application.user.role}`);
      console.log(`Ngày tạo: ${application.user.createdAt.toLocaleString('vi-VN')}`);
      
      console.log('\n⚠️  LƯU Ý:');
      console.log('Mật khẩu đã được gửi qua email khi duyệt đơn.');
      console.log('Nếu partner quên mật khẩu, sử dụng chức năng reset password.');
    } else {
      console.log('\n⚠️  Chưa có tài khoản được tạo cho partner này.');
    }

    console.log('\n' + '='.repeat(50) + '\n');

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

getPartnerInfo();
