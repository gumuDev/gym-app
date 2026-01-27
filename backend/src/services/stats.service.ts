import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Obtener estadísticas del dashboard para un gym
 */
export const getDashboardStats = async (gymId: string) => {
  try {
    // Fecha actual y rango del mes
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Ingresos del mes actual (suma de membresías vendidas este mes)
    const monthlyRevenue = await prisma.membership.aggregate({
      where: {
        gym_id: gymId,
        created_at: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: {
        amount_paid: true,
      },
    });

    // Total de miembros
    const totalMembers = await prisma.member.count({
      where: { gym_id: gymId },
    });

    // Miembros activos
    const activeMembers = await prisma.member.count({
      where: {
        gym_id: gymId,
        is_active: true,
      },
    });

    // Asistencias de hoy
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const todayAttendances = await prisma.attendance.count({
      where: {
        gym_id: gymId,
        checked_at: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    // Membresías por vencer en los próximos 7 días
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(now.getDate() + 7);

    const expiringMemberships = await prisma.membership.count({
      where: {
        gym_id: gymId,
        status: 'ACTIVE',
        end_date: {
          gte: now,
          lte: sevenDaysFromNow,
        },
      },
    });

    return {
      monthlyRevenue: monthlyRevenue._sum.amount_paid || 0,
      totalMembers,
      activeMembers,
      todayAttendances,
      expiringMemberships,
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas del dashboard:', error);
    throw error;
  }
};
