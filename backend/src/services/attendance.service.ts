import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Registrar asistencia por código QR
 */
export const createAttendance = async (gymId: string, memberCode: string, notes?: string) => {
  // Buscar el member por código
  const member = await prisma.member.findFirst({
    where: {
      code: memberCode,
      gym_id: gymId,
    },
    include: {
      memberships: {
        where: { status: 'ACTIVE' },
        orderBy: { end_date: 'desc' },
        take: 1,
      },
    },
  });

  if (!member) {
    throw new Error('Código inválido');
  }

  if (!member.is_active) {
    throw new Error('Miembro inactivo');
  }

  // Verificar si tiene membresía activa
  const activeMembership = member.memberships[0];
  if (!activeMembership) {
    throw new Error('El miembro no tiene membresía activa');
  }

  // Verificar si ya registró asistencia hoy
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const existingAttendance = await prisma.attendance.findFirst({
    where: {
      gym_id: gymId,
      member_id: member.id,
      checked_at: {
        gte: today,
        lt: tomorrow,
      },
    },
  });

  if (existingAttendance) {
    // Ya existe una asistencia hoy
    const error: any = new Error('Asistencia ya registrada hoy');
    error.alreadyRegistered = true;
    error.registeredAt = existingAttendance.checked_at;
    error.member = {
      id: member.id,
      code: member.code,
      name: member.name,
      photo_url: member.photo_url,
    };
    throw error;
  }

  // Verificar si la membresía está por vencer (menos de 7 días)
  const daysLeft = Math.ceil(
    (activeMembership.end_date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  // Registrar asistencia
  const attendance = await prisma.attendance.create({
    data: {
      gym_id: gymId,
      member_id: member.id,
      notes,
    },
    include: {
      member: {
        select: {
          id: true,
          code: true,
          name: true,
          photo_url: true,
        },
      },
    },
  });

  return {
    attendance,
    member: {
      ...member,
      activeMembership,
      daysLeft,
      warning: daysLeft <= 7 ? `Membresía vence en ${daysLeft} días` : null,
    },
  };
};

/**
 * Listar asistencias del gym
 */
export const getAllAttendances = async (gymId: string, limit: number = 50) => {
  return await prisma.attendance.findMany({
    where: { gym_id: gymId },
    orderBy: { checked_at: 'desc' },
    take: limit,
    include: {
      member: {
        select: {
          id: true,
          code: true,
          name: true,
          photo_url: true,
        },
      },
    },
  });
};

/**
 * Obtener asistencias de hoy
 */
export const getTodayAttendances = async (gymId: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return await prisma.attendance.findMany({
    where: {
      gym_id: gymId,
      checked_at: {
        gte: today,
      },
    },
    orderBy: { checked_at: 'desc' },
    include: {
      member: {
        select: {
          id: true,
          code: true,
          name: true,
          photo_url: true,
        },
      },
    },
  });
};

/**
 * Obtener asistencias de un member
 */
export const getAttendancesByMember = async (gymId: string, memberId: string) => {
  return await prisma.attendance.findMany({
    where: {
      gym_id: gymId,
      member_id: memberId,
    },
    orderBy: { checked_at: 'desc' },
    take: 30, // Últimas 30 asistencias
  });
};
