const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPendingBookings() {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        status: {
          in: ['PENDING', 'PENDING_PAYMENT']
        }
      },
      select: {
        id: true,
        status: true,
        totalPrice: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('\n📋 Pending Bookings:');
    console.log('='.repeat(60));
    
    if (bookings.length === 0) {
      console.log('❌ No pending bookings found');
    } else {
      bookings.forEach((booking, index) => {
        const last6 = booking.id.slice(-6).toUpperCase();
        console.log(`\n${index + 1}. Booking ID: ${booking.id}`);
        console.log(`   Last 6 chars: ${last6}`);
        console.log(`   Status: ${booking.status}`);
        console.log(`   Total: ${booking.totalPrice.toLocaleString()}đ`);
        console.log(`   Created: ${booking.createdAt.toLocaleString('vi-VN')}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`Total: ${bookings.length} pending booking(s)\n`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPendingBookings();
