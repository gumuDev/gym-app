import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Crear Super Admin
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const superAdmin = await prisma.superAdmin.upsert({
    where: { email: 'admin@gymapp.com' },
    update: {},
    create: {
      email: 'admin@gymapp.com',
      password: hashedPassword,
      name: 'Super Admin',
    },
  });

  console.log('✅ Super Admin created:', superAdmin.email);

  // Crear configuración SaaS inicial
  await prisma.saasConfig.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      monthly_price: 50.0,
      trial_days: 30,
      max_members_per_plan: 100,
    },
  });

  console.log('✅ SaaS Config created');

  console.log('🎉 Seed completed!');
  console.log('\n📋 Credentials:');
  console.log('Email: admin@gymapp.com');
  console.log('Password: admin123');
}

main()
  .catch(e => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
