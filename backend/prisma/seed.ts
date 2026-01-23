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

  // Crear Gym de prueba
  const testGym = await prisma.gym.upsert({
    where: { slug: 'gym-olimpo' },
    update: {},
    create: {
      name: 'Gym Olimpo',
      slug: 'gym-olimpo',
      address: 'Av. Principal 123, Ciudad',
      phone: '+1234567890',
      email: 'contacto@gimolimp.com',
      is_active: true,
    },
  });

  console.log('✅ Test Gym created:', testGym.name);

  // Crear Admin del Gym de prueba
  const gymAdminPassword = await bcrypt.hash('admin123', 10);

  const gymAdmin = await prisma.user.upsert({
    where: {
      gym_id_email: {
        gym_id: testGym.id,
        email: 'admin@gimolimp.com'
      }
    },
    update: {},
    create: {
      email: 'admin@gimolimp.com',
      password: gymAdminPassword,
      name: 'Admin Olimpo',
      role: 'ADMIN',
      gym_id: testGym.id,
    },
  });

  console.log('✅ Gym Admin created:', gymAdmin.email);

  // Crear algunas disciplinas de prueba
  const disciplines = await Promise.all([
    prisma.discipline.upsert({
      where: {
        gym_id_name: {
          gym_id: testGym.id,
          name: 'Crossfit',
        },
      },
      update: {},
      create: {
        name: 'Crossfit',
        description: 'Entrenamiento funcional de alta intensidad',
        gym_id: testGym.id,
      },
    }),
    prisma.discipline.upsert({
      where: {
        gym_id_name: {
          gym_id: testGym.id,
          name: 'Musculación',
        },
      },
      update: {},
      create: {
        name: 'Musculación',
        description: 'Entrenamiento con pesas',
        gym_id: testGym.id,
      },
    }),
  ]);

  console.log('✅ Disciplines created:', disciplines.length);

  console.log('🎉 Seed completed!');
  console.log('\n📋 Credentials:');
  console.log('Super Admin:');
  console.log('  Email: admin@gymapp.com');
  console.log('  Password: admin123');
  console.log('\nGym Admin (Gym Olimpo):');
  console.log('  Email: admin@gimolimp.com');
  console.log('  Password: admin123');
}

main()
  .catch(e => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
