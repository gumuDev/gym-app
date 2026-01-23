import prisma from '../utils/prisma';

/**
 * Obtener información del gym actual
 */
export const getMyGym = async (gymId: string) => {
  const gym = await prisma.gym.findUnique({
    where: { id: gymId },
    select: {
      id: true,
      name: true,
      slug: true,
      email: true,
      phone: true,
      address: true,
      logo_url: true,
      is_active: true,
      setup_completed: true,
      telegram_bot_token: true,
      created_at: true,
      updated_at: true,
    },
  });

  if (!gym) {
    throw new Error('Gimnasio no encontrado');
  }

  return gym;
};

/**
 * Actualizar información del gym actual
 */
export const updateMyGym = async (
  gymId: string,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    logo_url?: string;
    telegram_bot_token?: string;
  }
) => {
  const gym = await prisma.gym.update({
    where: { id: gymId },
    data,
    select: {
      id: true,
      name: true,
      slug: true,
      email: true,
      phone: true,
      address: true,
      logo_url: true,
      is_active: true,
      setup_completed: true,
      telegram_bot_token: true,
      updated_at: true,
    },
  });

  return gym;
};

/**
 * Marcar el setup como completado
 */
export const completeSetup = async (gymId: string) => {
  const gym = await prisma.gym.update({
    where: { id: gymId },
    data: { setup_completed: true },
    select: {
      id: true,
      name: true,
      setup_completed: true,
    },
  });

  return gym;
};
