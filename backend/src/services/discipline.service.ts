import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateDisciplineData {
  name: string;
  description?: string;
}

interface UpdateDisciplineData {
  name?: string;
  description?: string;
}

/**
 * Listar disciplinas del gym
 */
export const getAllDisciplines = async (gymId: string) => {
  return await prisma.discipline.findMany({
    where: { gym_id: gymId },
    orderBy: { created_at: 'desc' },
    include: {
      _count: {
        select: {
          pricing_plans: true,
          memberships: true,
        },
      },
    },
  });
};

/**
 * Crear disciplina
 */
export const createDiscipline = async (gymId: string, data: CreateDisciplineData) => {
  // Verificar si ya existe una disciplina con ese nombre
  const existing = await prisma.discipline.findFirst({
    where: {
      gym_id: gymId,
      name: data.name,
    },
  });

  if (existing) {
    throw new Error('Ya existe una disciplina con ese nombre');
  }

  return await prisma.discipline.create({
    data: {
      gym_id: gymId,
      name: data.name,
      description: data.description,
    },
  });
};

/**
 * Actualizar disciplina
 */
export const updateDiscipline = async (
  gymId: string,
  disciplineId: string,
  data: UpdateDisciplineData
) => {
  const discipline = await prisma.discipline.findFirst({
    where: {
      id: disciplineId,
      gym_id: gymId,
    },
  });

  if (!discipline) {
    throw new Error('Disciplina no encontrada');
  }

  // Si se actualiza el nombre, verificar que no exista
  if (data.name && data.name !== discipline.name) {
    const existing = await prisma.discipline.findFirst({
      where: {
        gym_id: gymId,
        name: data.name,
        id: { not: disciplineId },
      },
    });

    if (existing) {
      throw new Error('Ya existe una disciplina con ese nombre');
    }
  }

  return await prisma.discipline.update({
    where: { id: disciplineId },
    data,
  });
};

/**
 * Desactivar disciplina
 */
export const deleteDiscipline = async (gymId: string, disciplineId: string) => {
  const discipline = await prisma.discipline.findFirst({
    where: {
      id: disciplineId,
      gym_id: gymId,
    },
  });

  if (!discipline) {
    throw new Error('Disciplina no encontrada');
  }

  return await prisma.discipline.update({
    where: { id: disciplineId },
    data: { is_active: false },
  });
};
