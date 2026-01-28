import { PrismaClient } from '@prisma/client';
import { format, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns';

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

/**
 * Obtener datos de ingresos del mes actual para gráfica (día por día)
 */
export const getMonthlyIncomeChart = async (gymId: string) => {
  try {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // Obtener todas las membresías del mes
    const memberships = await prisma.membership.findMany({
      where: {
        gym_id: gymId,
        created_at: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      select: {
        created_at: true,
        amount_paid: true,
      },
    });

    // Agrupar por día
    const incomeByDay: Record<string, number> = {};

    // Inicializar todos los días del mes en 0
    const allDays = eachDayOfInterval({ start: monthStart, end: now });
    allDays.forEach(day => {
      const dayKey = format(day, 'dd/MM');
      incomeByDay[dayKey] = 0;
    });

    // Sumar ingresos por día
    memberships.forEach(membership => {
      const dayKey = format(new Date(membership.created_at), 'dd/MM');
      incomeByDay[dayKey] = (incomeByDay[dayKey] || 0) + Number(membership.amount_paid);
    });

    // Convertir a array para la gráfica
    const chartData = Object.entries(incomeByDay).map(([day, income]) => ({
      day,
      income: Number(income.toFixed(2)),
    }));

    return chartData;
  } catch (error) {
    console.error('Error obteniendo datos de gráfica de ingresos:', error);
    throw error;
  }
};

/**
 * Obtener distribución de miembros activos por disciplina
 */
export const getDisciplineDistribution = async (gymId: string) => {
  try {
    // Obtener todas las membresías activas con sus disciplinas
    const activeMemberships = await prisma.membership.findMany({
      where: {
        gym_id: gymId,
        status: 'ACTIVE',
      },
      include: {
        discipline: true,
      },
    });

    // Agrupar por disciplina
    const disciplineCount: Record<string, number> = {};

    activeMemberships.forEach(membership => {
      const disciplineName = membership.discipline.name;
      disciplineCount[disciplineName] = (disciplineCount[disciplineName] || 0) + 1;
    });

    // Convertir a array para la gráfica
    const total = Object.values(disciplineCount).reduce((sum, count) => sum + count, 0);

    const chartData = Object.entries(disciplineCount).map(([name, count]) => ({
      name,
      value: count,
      percentage: total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0,
    }));

    // Ordenar por cantidad descendente
    chartData.sort((a, b) => b.value - a.value);

    return chartData;
  } catch (error) {
    console.error('Error obteniendo distribución por disciplina:', error);
    throw error;
  }
};
