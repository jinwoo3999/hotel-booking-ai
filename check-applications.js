const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkApplications() {
  try {
    const apps = await prisma.partnerApplication.findMany({
      orderBy: { submittedAt: 'desc' }
    });
    
    console.log(`\n📊 Total applications: ${apps.length}\n`);
    
    if (apps.length === 0) {
      console.log("❌ No applications found in database");
    } else {
      apps.forEach((app, index) => {
        console.log(`\n${index + 1}. Application ID: ${app.id}`);
        console.log(`   Hotel: ${app.hotelName}`);
        console.log(`   Contact: ${app.fullName} (${app.email})`);
        console.log(`   Status: ${app.status}`);
        console.log(`   Submitted: ${app.submittedAt}`);
      });
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkApplications();
