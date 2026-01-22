import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreatePricingPlanData {
  discipline_id: string;
  num_people: number;
  num_months: number;
  price: number;
}

/**
 * Listar planes de precios del gym
 */
export const getAllPricingPlans = async (gymId: string) => {
  return await prisma.pricingPlan.findMany({
    where: { gym_id: gymId },
    include: {
      discipline: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: [{ discipline_id: 'asc' }, { num_people: 'asc' }, { num_months: 'asc' }],
  });
};

/**
 * Crear plan de precios
 */
export const createPricingPlan = async (gymId: string, data: CreatePricingPlanData) => {
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

  // Verificar si ya existe un plan con esos parámetros
  const existing = await prisma.pricingPlan.findFirst({
    where: {
      gym_id: gymId,
      discipline_id: data.discipline_id,
      num_people: data.num_people,
      num_months: data.num_months,
    },
  });

  if (existing) {
    throw new Error('Ya existe un plan con esos parámetros');
  }

  return await prisma.pricingPlan.create({
    data: {
      gym_id: gymId,
      discipline_id: data.discipline_id,
      num_people: data.num_people,
      num_months: data.num_months,
      price: data.price,
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
};

/**
 * Actualizar plan de precios (solo el precio)
 */
export const updatePricingPlan = async (gymId: string, planId: string, price: number) => {
  const plan = await prisma.pricingPlan.findFirst({
    where: {
      id: planId,
      gym_id: gymId,
    },
  });

  if (!plan) {
    throw new Error('Plan de precios no encontrado');
  }

  return await prisma.pricingPlan.update({
    where: { id: planId },
    data: { price },
    include: {
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
 * Eliminar plan de precios
 */
export const deletePricingPlan = async (gymId: string, planId: string) => {
  const plan = await prisma.pricingPlan.findFirst({
    where: {
      id: planId,
      gym_id: gymId,
    },
  });

  if (!plan) {
    throw new Error('Plan de precios no encontrado');
  }

  return await prisma.pricingPlan.delete({
    where: { id: planId },
  });
};

/**
 * Calcular precio según parámetros
 */
export const calculatePrice = async (
  gymId: string,
  disciplineId: string,
  numPeople: number,
  numMonths: number
) => {
  const plan = await prisma.pricingPlan.findFirst({
    where: {
      gym_id: gymId,
      discipline_id: disciplineId,
      num_people: numPeople,
      num_months: numMonths,
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

  if (!plan) {
    return {
      found: false,
      message: 'No se encontró un plan con esos parámetros',
    };
  }

  return {
    found: true,
    plan,
    totalPrice: plan.price,
  };
};
