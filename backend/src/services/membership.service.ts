import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateMembershipData {
  member_id: string;
  discipline_id: string;
  start_date: string;
  end_date: string;
  amount_paid: number;
  payment_method?: string;
  notes?: string;
}

/**
 * Listar membresías del gym
 */
export const getAllMemberships = async (gymId: string) => {
  return await prisma.membership.findMany({
    where: { gym_id: gymId },
    orderBy: { created_at: 'desc' },
    include: {
      member: {
        select: {
          id: true,
          code: true,
          name: true,
          phone: true,
        },
      },
      discipline: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

/**
 * Crear membresía (registrar pago)
 */
export const createMembership = async (gymId: string, data: CreateMembershipData) => {
  // Verificar que el member pertenece al gym
  const member = await prisma.member.findFirst({
    where: {
      id: data.member_id,
      gym_id: gymId,
    },
  });

  if (!member) {
    throw new Error('Miembro no encontrado');
  }

  // Verificar que la disciplina pertenece al gym
  const discipline = await prisma.discipline.findFirst({
    where: {
      id: data.discipline_id,
      gym_id: gymId,
    },
  });

  if (!discipline) {
    throw new Error('Disciplina no encontrada');
  }

  // Crear membresía
  return await prisma.membership.create({
    data: {
      gym_id: gymId,
      member_id: data.member_id,
      discipline_id: data.discipline_id,
      start_date: new Date(data.start_date),
      end_date: new Date(data.end_date),
      amount_paid: data.amount_paid,
      payment_method: data.payment_method,
      notes: data.notes,
      status: 'ACTIVE',
    },
    include: {
      member: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
      discipline: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

/**
 * Obtener membresía por ID
 */
export const getMembershipById = async (gymId: string, membershipId: string) => {
  const membership = await prisma.membership.findFirst({
    where: {
      id: membershipId,
      gym_id: gymId,
    },
    include: {
      member: true,
      discipline: true,
    },
  });

  if (!membership) {
    throw new Error('Membresía no encontrada');
  }

  return membership;
};

/**
 * Obtener membresías de un member
 */
export const getMembershipsByMember = async (gymId: string, memberId: string) => {
  return await prisma.membership.findMany({
    where: {
      gym_id: gymId,
      member_id: memberId,
    },
    orderBy: { created_at: 'desc' },
    include: {
      discipline: true,
    },
  });
};

/**
 * Obtener membresías por vencer (próximos 7 días)
 */
export const getExpiringMemberships = async (gymId: string) => {
  const now = new Date();
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(now.getDate() + 7);

  return await prisma.membership.findMany({
    where: {
      gym_id: gymId,
      status: 'ACTIVE',
      end_date: {
        gte: now,
        lte: sevenDaysFromNow,
      },
    },
    orderBy: { end_date: 'asc' },
    include: {
      member: {
        select: {
          id: true,
          code: true,
          name: true,
          phone: true,
          telegram_chat_id: true,
        },
      },
      discipline: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

/**
 * Renovar membresía
 */
export const renewMembership = async (
  gymId: string,
  membershipId: string,
  numMonths: number,
  amountPaid: number,
  paymentMethod?: string,
  notes?: string
) => {
  const oldMembership = await prisma.membership.findFirst({
    where: {
      id: membershipId,
      gym_id: gymId,
    },
  });

  if (!oldMembership) {
    throw new Error('Membresía no encontrada');
  }

  // Calcular nuevas fechas
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + numMonths);

  // Marcar membresía anterior como expirada
  await prisma.membership.update({
    where: { id: membershipId },
    data: { status: 'EXPIRED' },
  });

  // Crear nueva membresía
  const newMembership = await prisma.membership.create({
    data: {
      gym_id: gymId,
      member_id: oldMembership.member_id,
      discipline_id: oldMembership.discipline_id,
      start_date: startDate,
      end_date: endDate,
      amount_paid: amountPaid,
      payment_method: paymentMethod,
      notes: notes,
      status: 'ACTIVE',
    },
    include: {
      member: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
      discipline: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return newMembership;
};
