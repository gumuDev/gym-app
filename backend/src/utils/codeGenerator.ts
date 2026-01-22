import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Genera un código único para un member del gym
 * Formato: GYM-001, GYM-002, etc.
 */
export const generateMemberCode = async (gymId: string): Promise<string> => {
  // Obtener el último member del gym
  const lastMember = await prisma.member.findFirst({
    where: { gym_id: gymId },
    orderBy: { created_at: 'desc' },
  });

  let nextNumber = 1;

  if (lastMember && lastMember.code) {
    // Extraer el número del código (GYM-001 -> 001)
    const match = lastMember.code.match(/GYM-(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  // Formatear con padding de 3 dígitos
  const paddedNumber = nextNumber.toString().padStart(3, '0');

  return `GYM-${paddedNumber}`;
};

/**
 * Genera un slug único para un gym basado en su nombre
 */
export const generateGymSlug = async (name: string): Promise<string> => {
  // Convertir a minúsculas y reemplazar espacios por guiones
  let slug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remover caracteres especiales
    .replace(/\s+/g, '-') // Reemplazar espacios por guiones
    .replace(/-+/g, '-'); // Remover guiones duplicados

  // Verificar si el slug ya existe
  const existingGym = await prisma.gym.findUnique({
    where: { slug },
  });

  // Si existe, agregar un número al final
  if (existingGym) {
    let counter = 1;
    let newSlug = `${slug}-${counter}`;

    while (await prisma.gym.findUnique({ where: { slug: newSlug } })) {
      counter++;
      newSlug = `${slug}-${counter}`;
    }

    return newSlug;
  }

  return slug;
};
