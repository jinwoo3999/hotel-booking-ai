const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function resetPassword() {
  console.log('🔑 Resetting user password...');
  
  const passwordHash = await hash('password', 10);
  
  console.log('Hash:', passwordHash);

  try {
    const user = await prisma.user.update({
      where: { email: 'user@gmail.com' },
      data: {
        password: passwordHash
      }
    });

    console.log('✅ Password reset successfully for:', user.email);
    console.log('New password: password');

  } catch (error) {
    console.error('Error resetting password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
