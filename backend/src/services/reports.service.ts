import { PrismaClient } from '@prisma/client';
import { startOfMonth, endOfMonth, format, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

const prisma = new PrismaClient();

/**
 * Interfaces de reportes
 */
export interface IncomeReportFilters {
  startDate: Date;
  endDate: Date;
  disciplineId?: string;
}

export interface IncomeReportData {
  summary: {
    totalIncome: number;
    totalMemberships: number;
    averageTicket: number;
  };
  byDiscipline: Array<{
    disciplineId: string;
    disciplineName: string;
    income: number;
    count: number;
    percentage: number;
  }>;
  byMonth: Array<{
    month: string;
    income: number;
    count: number;
  }>;
  memberships: Array<{
    id: string;
    date: Date;
    memberName: string;
    memberCode: string;
    disciplineName: string;
    amount: number;
    paymentMethod: string | null;
  }>;
}

export interface AttendanceReportFilters {
  startDate: Date;
  endDate: Date;
  memberId?: string;
}

export interface AttendanceReportData {
  summary: {
    totalAttendances: number;
    uniqueMembers: number;
    averagePerDay: number;
  };
  byDay: Array<{
    date: string;
    count: number;
  }>;
  byHour: Array<{
    hour: number;
    count: number;
  }>;
  topMembers: Array<{
    memberId: string;
    memberName: string;
    memberCode: string;
    count: number;
  }>;
}

export interface MembersReportFilters {
  startDate: Date;
  endDate: Date;
}

export interface MembersReportData {
  summary: {
    totalMembers: number;
    activeMembers: number;
    inactiveMembers: number;
    newMembers: number;
  };
  byMonth: Array<{
    month: string;
    newMembers: number;
    totalActive: number;
  }>;
  byDiscipline: Array<{
    disciplineId: string;
    disciplineName: string;
    activeCount: number;
    percentage: number;
  }>;
}

/**
 * Reporte de Ingresos
 */
export const getIncomeReport = async (
  gymId: string,
  filters: IncomeReportFilters
): Promise<IncomeReportData> => {
  try {
    const { startDate, endDate, disciplineId } = filters;

    // Construir where clause
    const where: any = {
      gym_id: gymId,
      created_at: {
        gte: startOfDay(startDate),
        lte: endOfDay(endDate),
      },
    };

    if (disciplineId) {
      where.discipline_id = disciplineId;
    }

    // Obtener todas las membresías del período
    const memberships = await prisma.membership.findMany({
      where,
      include: {
        member: {
          select: {
            name: true,
            code: true,
          },
        },
        discipline: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    // Calcular summary
    const totalIncome = memberships.reduce((sum, m) => sum + m.amount_paid, 0);
    const totalMemberships = memberships.length;
    const averageTicket = totalMemberships > 0 ? totalIncome / totalMemberships : 0;

    // Agrupar por disciplina
    const byDisciplineMap = new Map<string, { name: string; income: number; count: number }>();

    memberships.forEach((m) => {
      const key = m.discipline_id;
      const existing = byDisciplineMap.get(key) || { name: m.discipline.name, income: 0, count: 0 };
      existing.income += m.amount_paid;
      existing.count += 1;
      byDisciplineMap.set(key, existing);
    });

    const byDiscipline = Array.from(byDisciplineMap.entries()).map(([id, data]) => ({
      disciplineId: id,
      disciplineName: data.name,
      income: data.income,
      count: data.count,
      percentage: totalIncome > 0 ? (data.income / totalIncome) * 100 : 0,
    }));

    // Agrupar por mes
    const byMonthMap = new Map<string, { income: number; count: number }>();

    memberships.forEach((m) => {
      const monthKey = format(new Date(m.created_at), 'MMM yyyy', { locale: es });
      const existing = byMonthMap.get(monthKey) || { income: 0, count: 0 };
      existing.income += m.amount_paid;
      existing.count += 1;
      byMonthMap.set(monthKey, existing);
    });

    const byMonth = Array.from(byMonthMap.entries())
      .map(([month, data]) => ({
        month,
        income: data.income,
        count: data.count,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Formatear memberships
    const formattedMemberships = memberships.map((m) => ({
      id: m.id,
      date: m.created_at,
      memberName: m.member.name,
      memberCode: m.member.code,
      disciplineName: m.discipline.name,
      amount: m.amount_paid,
      paymentMethod: m.payment_method,
    }));

    return {
      summary: {
        totalIncome,
        totalMemberships,
        averageTicket,
      },
      byDiscipline,
      byMonth,
      memberships: formattedMemberships,
    };
  } catch (error) {
    console.error('Error generando reporte de ingresos:', error);
    throw error;
  }
};

/**
 * Reporte de Asistencias
 */
export const getAttendanceReport = async (
  gymId: string,
  filters: AttendanceReportFilters
): Promise<AttendanceReportData> => {
  try {
    const { startDate, endDate, memberId } = filters;

    // Construir where clause
    const where: any = {
      gym_id: gymId,
      checked_at: {
        gte: startOfDay(startDate),
        lte: endOfDay(endDate),
      },
    };

    if (memberId) {
      where.member_id = memberId;
    }

    // Obtener todas las asistencias del período
    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        member: {
          select: {
            name: true,
            code: true,
          },
        },
      },
      orderBy: {
        checked_at: 'desc',
      },
    });

    // Calcular summary
    const totalAttendances = attendances.length;
    const uniqueMembersSet = new Set(attendances.map((a) => a.member_id));
    const uniqueMembers = uniqueMembersSet.size;

    // Calcular días entre startDate y endDate
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const averagePerDay = diffDays > 0 ? totalAttendances / diffDays : 0;

    // Agrupar por día
    const byDayMap = new Map<string, number>();

    attendances.forEach((a) => {
      const dayKey = format(new Date(a.checked_at), 'dd/MM/yyyy');
      byDayMap.set(dayKey, (byDayMap.get(dayKey) || 0) + 1);
    });

    const byDay = Array.from(byDayMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Agrupar por hora
    const byHourMap = new Map<number, number>();

    attendances.forEach((a) => {
      const hour = new Date(a.checked_at).getHours();
      byHourMap.set(hour, (byHourMap.get(hour) || 0) + 1);
    });

    const byHour = Array.from(byHourMap.entries())
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => a.hour - b.hour);

    // Top members (sin filtro de memberId)
    let topMembers: Array<{
      memberId: string;
      memberName: string;
      memberCode: string;
      count: number;
    }> = [];

    if (!memberId) {
      // Contar asistencias por member
      const memberCountMap = new Map<
        string,
        { name: string; code: string; count: number }
      >();

      attendances.forEach((a) => {
        const existing = memberCountMap.get(a.member_id) || {
          name: a.member.name,
          code: a.member.code,
          count: 0,
        };
        existing.count += 1;
        memberCountMap.set(a.member_id, existing);
      });

      topMembers = Array.from(memberCountMap.entries())
        .map(([id, data]) => ({
          memberId: id,
          memberName: data.name,
          memberCode: data.code,
          count: data.count,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10
    }

    return {
      summary: {
        totalAttendances,
        uniqueMembers,
        averagePerDay,
      },
      byDay,
      byHour,
      topMembers,
    };
  } catch (error) {
    console.error('Error generando reporte de asistencias:', error);
    throw error;
  }
};

/**
 * Reporte de Members
 */
export const getMembersReport = async (
  gymId: string,
  filters: MembersReportFilters
): Promise<MembersReportData> => {
  try {
    const { startDate, endDate } = filters;

    // Total de members (todos, no solo del período)
    const totalMembers = await prisma.member.count({
      where: { gym_id: gymId },
    });

    const activeMembers = await prisma.member.count({
      where: {
        gym_id: gymId,
        is_active: true,
      },
    });

    const inactiveMembers = totalMembers - activeMembers;

    // Nuevos members en el período
    const newMembers = await prisma.member.count({
      where: {
        gym_id: gymId,
        created_at: {
          gte: startOfDay(startDate),
          lte: endOfDay(endDate),
        },
      },
    });

    // Obtener nuevos members con sus fechas para agrupar por mes
    const newMembersWithDates = await prisma.member.findMany({
      where: {
        gym_id: gymId,
        created_at: {
          gte: startOfDay(startDate),
          lte: endOfDay(endDate),
        },
      },
      select: {
        created_at: true,
      },
    });

    // Agrupar nuevos members por mes
    const byMonthMap = new Map<string, { newMembers: number }>();

    newMembersWithDates.forEach((m) => {
      const monthKey = format(new Date(m.created_at), 'MMM yyyy', { locale: es });
      const existing = byMonthMap.get(monthKey) || { newMembers: 0 };
      existing.newMembers += 1;
      byMonthMap.set(monthKey, existing);
    });

    // Calcular total active por mes (simplificado - usar el actual)
    const byMonth = Array.from(byMonthMap.entries())
      .map(([month, data]) => ({
        month,
        newMembers: data.newMembers,
        totalActive: activeMembers, // Simplificado (en producción debería ser histórico)
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Distribución por disciplina (basado en memberships activas)
    const activeMemberships = await prisma.membership.findMany({
      where: {
        gym_id: gymId,
        status: 'ACTIVE',
      },
      include: {
        discipline: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const byDisciplineMap = new Map<string, { name: string; count: number }>();

    activeMemberships.forEach((m) => {
      const key = m.discipline_id;
      const existing = byDisciplineMap.get(key) || { name: m.discipline.name, count: 0 };
      existing.count += 1;
      byDisciplineMap.set(key, existing);
    });

    const totalActiveMemberships = activeMemberships.length;

    const byDiscipline = Array.from(byDisciplineMap.entries()).map(([id, data]) => ({
      disciplineId: id,
      disciplineName: data.name,
      activeCount: data.count,
      percentage:
        totalActiveMemberships > 0 ? (data.count / totalActiveMemberships) * 100 : 0,
    }));

    return {
      summary: {
        totalMembers,
        activeMembers,
        inactiveMembers,
        newMembers,
      },
      byMonth,
      byDiscipline,
    };
  } catch (error) {
    console.error('Error generando reporte de members:', error);
    throw error;
  }
};
