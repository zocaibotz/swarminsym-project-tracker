const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const projectCount = await prisma.project.count();
    console.log(`Database connection OK. Project count: ${projectCount}`);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection().catch((error) => {
  console.error('Database connection failed:', error);
  process.exit(1);
});
