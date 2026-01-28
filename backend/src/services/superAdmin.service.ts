import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/hash';
import { generateGymSlug } from '../utils/codeGenerator';

const prisma = new PrismaClient();

/**
 * Obtener métricas del dashboard
 */
export const getDashboardMetrics = async () => {
  const totalGyms = await prisma.gym.count();
  const activeGyms = await prisma.gym.count({ where: { is_active: true } });
  const totalMembers = await prisma.member.count();
  const activeMembers = await prisma.member.count({ where: { is_active: true } });

  // MRR (Monthly Recurring Revenue)
  const saasConfig = await prisma.saasConfig.findFirst();
  const monthlyRecurringRevenue = activeGyms * (saasConfig?.monthly_price || 50);

  return {
    totalGyms,
    activeGyms,
    totalMembers,
    activeMembers,
    monthlyRecurringRevenue,
  };
};

/**
 * Listar todos los gyms
 */
export const getAllGyms = async () => {
  const gyms = await prisma.gym.findMany({
    orderBy: { created_at: 'desc' },
    include: {
      _count: {
        select: {
          members: true,
          users: true,
        },
      },
      users: {
        where: { role: 'ADMIN' },
        select: {
          id: true,
          name: true,
          email: true,
        },
        take: 1,
      },
    },
  });

  // Formatear respuesta para incluir owner_name y owner_email
  return gyms.map(gym => ({
    ...gym,
    owner_name: gym.users[0]?.name || 'Sin admin',
    owner_email: gym.users[0]?.email || 'N/A',
  }));
};

/**
 * Obtener gym por ID
 */
export const getGymById = async (gymId: string) => {
  const gym = await prisma.gym.findUnique({
    where: { id: gymId },
    include: {
      _count: {
        select: {
          members: true,
          users: true,
          memberships: true,
          attendances: true,
        },
      },
      users: {
        where: { is_active: true },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  if (!gym) {
    throw new Error('Gimnasio no encontrado');
  }

  return gym;
};

interface CreateGymData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}

/**
 * Crear nuevo gym + admin user
 */
export const createGym = async (data: CreateGymData) => {
  const { name, email, phone, address, adminName, adminEmail, adminPassword } = data;

  // Verificar si el email del gym ya existe
  const existingGym = await prisma.gym.findFirst({
    where: { email },
  });

  if (existingGym) {
    throw new Error('Ya existe un gimnasio con ese email');
  }

  // Verificar si el email del admin ya existe
  const existingAdmin = await prisma.user.findFirst({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    throw new Error('Ya existe un usuario con ese email');
  }

  // Generar slug único
  const slug = await generateGymSlug(name);

  // Hash password del admin
  const hashedPassword = await hashPassword(adminPassword);

  // Calcular trial end date (30 días)
  const saasConfig = await prisma.saasConfig.findFirst();
  const trialDays = saasConfig?.trial_days || 30;
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);

  // Crear gym y admin en una transacción
  const result = await prisma.$transaction(async tx => {
    // Crear gym
    const gym = await tx.gym.create({
      data: {
        name,
        slug,
        email,
        phone,
        address,
        trial_ends_at: trialEndsAt,
      },
    });

    // Crear admin user
    const admin = await tx.user.create({
      data: {
        gym_id: gym.id,
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    return { gym, admin };
  });

  // TODO: Enviar email con credenciales al admin

  return result;
};

interface UpdateGymData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  logo_url?: string;
  telegram_bot_token?: string;
}

/**
 * Actualizar gym
 */
export const updateGym = async (gymId: string, data: UpdateGymData) => {
  const gym = await prisma.gym.findUnique({ where: { id: gymId } });

  if (!gym) {
    throw new Error('Gimnasio no encontrado');
  }

  return await prisma.gym.update({
    where: { id: gymId },
    data,
  });
};

/**
 * Activar/Suspender gym
 */
export const toggleGymStatus = async (gymId: string) => {
  const gym = await prisma.gym.findUnique({ where: { id: gymId } });

  if (!gym) {
    throw new Error('Gimnasio no encontrado');
  }

  return await prisma.gym.update({
    where: { id: gymId },
    data: { is_active: !gym.is_active },
  });
};

/**
 * Listar invoices
 */
export const getAllInvoices = async () => {
  return await prisma.gymInvoice.findMany({
    include: {
      gym: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { created_at: 'desc' },
  });
};

/**
 * Generar facturas mensuales para todos los gyms activos
 */
export const generateMonthlyInvoices = async () => {
  const activeGyms = await prisma.gym.findMany({
    where: { is_active: true },
  });

  const saasConfig = await prisma.saasConfig.findFirst();
  const monthlyPrice = saasConfig?.monthly_price || 50;

  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const dueDate = new Date(now.getFullYear(), now.getMonth() + 1, 10); // Vence el día 10

  const invoices = await prisma.$transaction(
    activeGyms.map(gym =>
      prisma.gymInvoice.create({
        data: {
          gym_id: gym.id,
          amount: monthlyPrice,
          status: 'PENDING',
          period_start: periodStart,
          period_end: periodEnd,
          due_date: dueDate,
        },
      })
    )
  );

  return invoices;
};
