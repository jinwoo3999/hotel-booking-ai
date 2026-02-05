const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function showDatabase() {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('📊 LUMINA STAY - DATABASE OVERVIEW');
    console.log('='.repeat(60) + '\n');
    
    // Statistics
    console.log('📈 STATISTICS:');
    const userCount = await prisma.user.count();
    const hotelCount = await prisma.hotel.count();
    const roomCount = await prisma.room.count();
    const bookingCount = await prisma.booking.count();
    const voucherCount = await prisma.voucher.count();
    
    console.log(`   Users: ${userCount}`);
    console.log(`   Hotels: ${hotelCount}`);
    console.log(`   Rooms: ${roomCount}`);
    console.log(`   Bookings: ${bookingCount}`);
    console.log(`   Vouchers: ${voucherCount}`);
    
    // Users by role
    console.log('\n👥 USERS BY ROLE:');
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: true
    });
    usersByRole.forEach(r => console.log(`   ${r.role}: ${r._count}`));
    
    // Sample users
    console.log('\n👤 SAMPLE USERS:');
    const users = await prisma.user.findMany({ 
      take: 5,
      select: { name: true, email: true, role: true, points: true }
    });
    users.forEach(u => {
      console.log(`   - ${u.name} (${u.email})`);
      console.log(`     Role: ${u.role}, Points: ${u.points}`);
    });
    
    // Hotels
    console.log('\n🏨 SAMPLE HOTELS:');
    const hotels = await prisma.hotel.findMany({ 
      take: 5,
      include: { _count: { select: { rooms: true } } }
    });
    hotels.forEach(h => {
      console.log(`   - ${h.name} (${h.city})`);
      console.log(`     Rating: ${h.rating}⭐, Rooms: ${h._count.rooms}`);
    });
    
    // Bookings by status
    console.log('\n📋 BOOKINGS BY STATUS:');
    const bookingsByStatus = await prisma.booking.groupBy({
      by: ['status'],
      _count: true,
      _sum: { totalPrice: true }
    });
    bookingsByStatus.forEach(b => {
      console.log(`   ${b.status}: ${b._count} bookings`);
      console.log(`     Total: ${(b._sum.totalPrice || 0).toLocaleString('vi-VN')}đ`);
    });
    
    // Recent bookings
    console.log('\n📅 RECENT BOOKINGS:');
    const bookings = await prisma.booking.findMany({ 
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { 
        user: { select: { name: true } },
        hotel: { select: { name: true } }
      }
    });
    bookings.forEach(b => {
      const date = b.createdAt.toLocaleDateString('vi-VN');
      console.log(`   - ${b.user.name} → ${b.hotel.name}`);
      console.log(`     ${b.totalPrice.toLocaleString('vi-VN')}đ - ${b.status} (${date})`);
    });
    
    // Vouchers
    console.log('\n🎟️  ACTIVE VOUCHERS:');
    const vouchers = await prisma.voucher.findMany({
      where: { endDate: { gte: new Date() } },
      take: 5
    });
    vouchers.forEach(v => {
      console.log(`   - ${v.code}: ${v.type === 'PERCENT' ? v.discount + '%' : v.discount.toLocaleString() + 'đ'}`);
      console.log(`     Used: ${v.usedCount}/${v.usageLimit}`);
    });
    
    // AI Features
    console.log('\n🤖 AI FEATURES:');
    const profileCount = await prisma.userProfile.count();
    const behaviorCount = await prisma.behaviorPattern.count();
    const holdCount = await prisma.roomHold.count({ where: { status: 'active' } });
    const watchCount = await prisma.priceWatch.count({ where: { active: true } });
    
    console.log(`   User Profiles: ${profileCount}`);
    console.log(`   Behavior Patterns: ${behaviorCount}`);
    console.log(`   Active Room Holds: ${holdCount}`);
    console.log(`   Active Price Watches: ${watchCount}`);
    
    console.log('\n' + '='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

showDatabase();
