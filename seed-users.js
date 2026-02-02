const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function seedUsers() {
  console.log('🌱 Creating users...');
  
  const passwordHash = await hash('password', 10);

  try {
    // Create admin user
    const admin = await prisma.user.upsert({
      where: { email: 'admin@gmail.com' },
      update: {},
      create: {
        email: 'admin@gmail.com',
        name: 'Super Admin',
        role: 'SUPER_ADMIN',
        password: passwordHash,
        emailVerified: new Date()
      }
    });

    // Create partner user
    const partner = await prisma.user.upsert({
      where: { email: 'partner@gmail.com' },
      update: {},
      create: {
        email: 'partner@gmail.com',
        name: 'Partner A',
        role: 'PARTNER',
        password: passwordHash,
        emailVerified: new Date()
      }
    });

    // Create regular user
    const user = await prisma.user.upsert({
      where: { email: 'user@gmail.com' },
      update: {},
      create: {
        email: 'user@gmail.com',
        name: 'Khách Vip',
        role: 'USER',
        password: passwordHash,
        points: 500,
        emailVerified: new Date()
      }
    });

    console.log('✅ Users created successfully!');
    console.log('Admin:', admin.email, admin.id);
    console.log('Partner:', partner.email, partner.id);
    console.log('User:', user.email, user.id);

  } catch (error) {
    console.error('Error creating users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedUsers();