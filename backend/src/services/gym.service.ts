import { PrismaClient } from '@prisma/client';
import * as telegramService from './telegram.service';

const prisma = new PrismaClient();

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

  // Si se actualizó el telegram_bot_token, reiniciar el bot
  if (data.telegram_bot_token) {
    try {
      console.log(`🔄 Reiniciando bot de Telegram para ${gym.name}...`);

      // Detener bot anterior si existe
      await telegramService.stopBot(gymId);

      // Iniciar nuevo bot con el token actualizado
      await telegramService.initBot(gymId, data.telegram_bot_token);

      console.log(`✅ Bot de Telegram actualizado para ${gym.name}`);
    } catch (error: any) {
      console.error(`❌ Error actualizando bot de Telegram para ${gym.name}:`, error.message);
      // No lanzar error para no afectar la actualización del gym
      // El token se guardó pero el bot no se inició
    }
  }

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
