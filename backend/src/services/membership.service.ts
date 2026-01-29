import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// INTERFACES
// ============================================

interface CreateMembershipData {
  member_id: string;
  discipline_id: string;
  start_date: string;
  end_date: string;
  amount_paid: number;
  payment_method?: string;
  notes?: string;
}

interface MemberInput {
  memberId: string;
  isPrimary?: boolean;
}

interface CreateGroupMembershipData {
  disciplineId: string;
  pricingPlanId: string;
  members: MemberInput[]; // Array de IDs de miembros
  paymentMethod?: string;
  notes?: string;
}

interface RenewMembershipData {
  memberIds: string[]; // IDs de los miembros que renuevan
  pricingPlanId: string;
  paymentMethod?: string;
  notes?: string;
}

// ============================================
// FUNCIONES DE VALIDACIÓN
// ============================================

/**
 * Validar que un pricing plan existe y pertenece al gym
 */
const validatePricingPlan = async (gymId: string, pricingPlanId: string) => {
  const pricingPlan = await prisma.pricingPlan.findFirst({
    where: {
      id: pricingPlanId,
      gym_id: gymId,
    },
  });

  if (!pricingPlan) {
    throw new Error('Plan de precios no encontrado');
  }

  return pricingPlan;
};

/**
 * Validar que todos los miembros existen y pertenecen al gym
 */
const validateMembers = async (gymId: string, memberIds: string[]) => {
  const members = await prisma.member.findMany({
    where: {
      id: { in: memberIds },
      gym_id: gymId,
      is_active: true,
    },
  });

  if (members.length !== memberIds.length) {
    throw new Error('Uno o más miembros no encontrados o inactivos');
  }

  return members;
};

/**
 * Validar que la disciplina existe y pertenece al gym
 */
const validateDiscipline = async (gymId: string, disciplineId: string) => {
  const discipline = await prisma.discipline.findFirst({
    where: {
      id: disciplineId,
      gym_id: gymId,
      is_active: true,
    },
  });

  if (!discipline) {
    throw new Error('Disciplina no encontrada o inactiva');
  }

  return discipline;
};

// ============================================
// FUNCIONES PRINCIPALES
// ============================================

/**
 * Listar membresías del gym (con soporte para membresías grupales)
 */
export const getAllMemberships = async (gymId: string) => {
  return await prisma.membership.findMany({
    where: { gym_id: gymId },
    orderBy: { created_at: 'desc' },
    include: {
      // Incluir miembros vía membership_members (nuevo)
      membershipMembers: {
        include: {
          member: {
            select: {
              id: true,
              code: true,
              name: true,
              phone: true,
              photo_url: true,
            },
          },
        },
        orderBy: {
          is_primary: 'desc', // Titular primero
        },
      },
      // Mantener member para compatibilidad con datos antiguos
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
      pricingPlan: {
        select: {
          id: true,
          num_people: true,
          num_months: true,
          price: true,
        },
      },
    },
  });
};

/**
 * Crear membresía individual (mantener compatibilidad)
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
      total_amount: data.amount_paid, // Mismo valor para membresías individuales
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
 * Crear membresía grupal (nueva funcionalidad)
 */
export const createGroupMembership = async (gymId: string, data: CreateGroupMembershipData) => {
  // 1. Validar pricing plan
  const pricingPlan = await validatePricingPlan(gymId, data.pricingPlanId);

  // 2. Validar cantidad de miembros
  if (data.members.length !== pricingPlan.num_people) {
    throw new Error(
      `Este plan requiere exactamente ${pricingPlan.num_people} miembro(s), pero se proporcionaron ${data.members.length}`
    );
  }

  // 3. Validar que todos los miembros existen
  const memberIds = data.members.map((m) => m.memberId);
  await validateMembers(gymId, memberIds);

  // 4. Validar disciplina
  await validateDiscipline(gymId, data.disciplineId);

  // 5. Verificar que al menos uno sea primary
  const hasPrimary = data.members.some((m) => m.isPrimary);
  if (!hasPrimary) {
    // Si no hay primary marcado, marcar el primero como primary
    data.members[0].isPrimary = true;
  }

  // 6. Calcular fechas y montos
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + pricingPlan.num_months);

  const pricePerPerson = pricingPlan.price;
  const totalAmount = pricePerPerson * data.members.length;

  // 7. Crear membresía con miembros en transacción
  const membership = await prisma.$transaction(async (tx) => {
    // Crear membresía
    const newMembership = await tx.membership.create({
      data: {
        gym_id: gymId,
        discipline_id: data.disciplineId,
        pricing_plan_id: data.pricingPlanId,
        start_date: startDate,
        end_date: endDate,
        total_amount: totalAmount,
        payment_method: data.paymentMethod,
        notes: data.notes,
        status: 'ACTIVE',
      },
    });

    // Crear membership_members
    await tx.membershipMember.createMany({
      data: data.members.map((member) => ({
        gym_id: gymId,
        membership_id: newMembership.id,
        member_id: member.memberId,
        price_applied: pricePerPerson,
        is_primary: member.isPrimary || false,
      })),
    });

    return newMembership;
  });

  // 8. Retornar membresía con relaciones
  return await getMembershipById(gymId, membership.id);
};

/**
 * Obtener membresía por ID (con soporte grupal)
 */
export const getMembershipById = async (gymId: string, membershipId: string) => {
  const membership = await prisma.membership.findFirst({
    where: {
      id: membershipId,
      gym_id: gymId,
    },
    include: {
      membershipMembers: {
        include: {
          member: {
            select: {
              id: true,
              code: true,
              name: true,
              phone: true,
              email: true,
              photo_url: true,
            },
          },
        },
        orderBy: {
          is_primary: 'desc',
        },
      },
      member: true, // Mantener para compatibilidad
      discipline: true,
      pricingPlan: true,
    },
  });

  if (!membership) {
    throw new Error('Membresía no encontrada');
  }

  return membership;
};

/**
 * Obtener membresías de un member (actualizado para buscar en membership_members)
 */
export const getMembershipsByMember = async (gymId: string, memberId: string) => {
  // Buscar tanto en el campo antiguo (member_id) como en la nueva tabla (membership_members)
  const memberships = await prisma.membership.findMany({
    where: {
      gym_id: gymId,
      OR: [
        { member_id: memberId }, // Compatibilidad con datos antiguos
        {
          membershipMembers: {
            some: {
              member_id: memberId,
            },
          },
        },
      ],
    },
    orderBy: { created_at: 'desc' },
    include: {
      discipline: true,
      pricingPlan: true,
      membershipMembers: {
        include: {
          member: {
            select: {
              id: true,
              code: true,
              name: true,
              phone: true,
            },
          },
        },
        orderBy: {
          is_primary: 'desc',
        },
      },
    },
  });

  return memberships;
};

/**
 * Obtener membresía activa de un miembro
 */
export const getActiveMembershipByMember = async (gymId: string, memberId: string) => {
  const now = new Date();

  const membership = await prisma.membership.findFirst({
    where: {
      gym_id: gymId,
      status: 'ACTIVE',
      end_date: {
        gte: now,
      },
      OR: [
        { member_id: memberId }, // Compatibilidad
        {
          membershipMembers: {
            some: {
              member_id: memberId,
            },
          },
        },
      ],
    },
    orderBy: {
      end_date: 'desc', // Obtener la que vence más tarde
    },
    include: {
      discipline: true,
      pricingPlan: true,
      membershipMembers: {
        include: {
          member: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
        },
      },
    },
  });

  return membership;
};

/**
 * Obtener membresías por vencer (próximos 7 días) - actualizado
 */
export const getExpiringMemberships = async (gymId: string, days: number = 7) => {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(now.getDate() + days);

  return await prisma.membership.findMany({
    where: {
      gym_id: gymId,
      status: 'ACTIVE',
      end_date: {
        gte: now,
        lte: futureDate,
      },
    },
    orderBy: { end_date: 'asc' },
    include: {
      membershipMembers: {
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
        },
      },
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
      pricingPlan: true,
    },
  });
};

/**
 * Renovar membresía (versión simple - mantener compatibilidad)
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
      total_amount: amountPaid,
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

/**
 * Renovar membresía grupal (nueva funcionalidad)
 */
export const renewGroupMembership = async (
  gymId: string,
  oldMembershipId: string,
  data: RenewMembershipData
) => {
  // 1. Obtener membresía anterior
  const oldMembership = await getMembershipById(gymId, oldMembershipId);

  // 2. Validar pricing plan
  const pricingPlan = await validatePricingPlan(gymId, data.pricingPlanId);

  // 3. Validar cantidad de miembros
  if (data.memberIds.length !== pricingPlan.num_people) {
    throw new Error(
      `Este plan requiere exactamente ${pricingPlan.num_people} miembro(s), pero se proporcionaron ${data.memberIds.length}`
    );
  }

  // 4. Validar que todos los miembros existen
  await validateMembers(gymId, data.memberIds);

  // 5. Calcular fechas y montos
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + pricingPlan.num_months);

  const pricePerPerson = pricingPlan.price;
  const totalAmount = pricePerPerson * data.memberIds.length;

  // 6. Determinar miembro principal (preferir el que ya era principal)
  const oldPrimaryMember = oldMembership.membershipMembers.find((mm) => mm.is_primary);
  const primaryMemberId =
    oldPrimaryMember && data.memberIds.includes(oldPrimaryMember.member_id)
      ? oldPrimaryMember.member_id
      : data.memberIds[0];

  // 7. Crear nueva membresía en transacción
  const newMembership = await prisma.$transaction(async (tx) => {
    // Marcar membresía anterior como expirada
    await tx.membership.update({
      where: { id: oldMembershipId },
      data: { status: 'EXPIRED' },
    });

    // Crear nueva membresía
    const membership = await tx.membership.create({
      data: {
        gym_id: gymId,
        discipline_id: oldMembership.discipline_id,
        pricing_plan_id: data.pricingPlanId,
        start_date: startDate,
        end_date: endDate,
        total_amount: totalAmount,
        payment_method: data.paymentMethod,
        notes: data.notes,
        status: 'ACTIVE',
      },
    });

    // Crear membership_members
    await tx.membershipMember.createMany({
      data: data.memberIds.map((memberId) => ({
        gym_id: gymId,
        membership_id: membership.id,
        member_id: memberId,
        price_applied: pricePerPerson,
        is_primary: memberId === primaryMemberId,
      })),
    });

    return membership;
  });

  // 8. Retornar nueva membresía con relaciones
  return await getMembershipById(gymId, newMembership.id);
};

/**
 * Cancelar membresía
 */
export const cancelMembership = async (gymId: string, membershipId: string, reason?: string) => {
  const membership = await prisma.membership.findFirst({
    where: {
      id: membershipId,
      gym_id: gymId,
    },
  });

  if (!membership) {
    throw new Error('Membresía no encontrada');
  }

  return await prisma.membership.update({
    where: { id: membershipId },
    data: {
      status: 'CANCELLED',
      notes: reason ? `${membership.notes || ''}\nMotivo de cancelación: ${reason}` : membership.notes,
    },
    include: {
      membershipMembers: {
        include: {
          member: true,
        },
      },
      discipline: true,
    },
  });
};

/**
 * Obtener estadísticas de membresías
 */
export const getMembershipStats = async (gymId: string) => {
  const now = new Date();

  const [total, active, expired, expiringSoon] = await Promise.all([
    prisma.membership.count({
      where: { gym_id: gymId },
    }),
    prisma.membership.count({
      where: {
        gym_id: gymId,
        status: 'ACTIVE',
        end_date: { gte: now },
      },
    }),
    prisma.membership.count({
      where: {
        gym_id: gymId,
        OR: [{ status: 'EXPIRED' }, { status: 'ACTIVE', end_date: { lt: now } }],
      },
    }),
    prisma.membership.count({
      where: {
        gym_id: gymId,
        status: 'ACTIVE',
        end_date: {
          gte: now,
          lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 días
        },
      },
    }),
  ]);

  return {
    total,
    active,
    expired,
    expiringSoon,
  };
};
