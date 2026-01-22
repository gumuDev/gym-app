import { PrismaClient } from '@prisma/client';
import { generateMemberCode } from '../utils/codeGenerator';

const prisma = new PrismaClient();

interface CreateMemberData {
  name: string;
  email?: string;
  phone: string;
  birth_date?: string;
  address?: string;
  emergency_contact?: string;
  photo_url?: string;
}

interface UpdateMemberData {
  name?: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  address?: string;
  emergency_contact?: string;
  photo_url?: string;
  telegram_chat_id?: string;
}

/**
 * Listar members del gym
 */
export const getAllMembers = async (gymId: string) => {
  return await prisma.member.findMany({
    where: { gym_id: gymId },
    orderBy: { created_at: 'desc' },
    include: {
      memberships: {
        where: { status: 'ACTIVE' },
        include: { discipline: true },
        orderBy: { end_date: 'desc' },
        take: 1,
      },
      _count: {
        select: {
          memberships: true,
          attendances: true,
        },
      },
    },
  });
};

/**
 * Crear member
 */
export const createMember = async (gymId: string, data: CreateMemberData) => {
  // Verificar si el teléfono ya existe en este gym
  const existingMember = await prisma.member.findFirst({
    where: {
      gym_id: gymId,
      phone: data.phone,
    },
  });

  if (existingMember) {
    throw new Error('Ya existe un miembro con ese teléfono');
  }

  // Generar código único
  const code = await generateMemberCode(gymId);

  // Crear member
  const member = await prisma.member.create({
    data: {
      gym_id: gymId,
      code,
      name: data.name,
      email: data.email,
      phone: data.phone,
      birth_date: data.birth_date ? new Date(data.birth_date) : null,
      address: data.address,
      emergency_contact: data.emergency_contact,
      photo_url: data.photo_url,
    },
  });

  return member;
};

/**
 * Obtener member por ID
 */
export const getMemberById = async (gymId: string, memberId: string) => {
  const member = await prisma.member.findFirst({
    where: {
      id: memberId,
      gym_id: gymId,
    },
    include: {
      memberships: {
        include: { discipline: true },
        orderBy: { created_at: 'desc' },
      },
      attendances: {
        orderBy: { checked_at: 'desc' },
        take: 10,
      },
      _count: {
        select: {
          memberships: true,
          attendances: true,
        },
      },
    },
  });

  if (!member) {
    throw new Error('Miembro no encontrado');
  }

  return member;
};

/**
 * Buscar member por código (para QR)
 */
export const getMemberByCode = async (code: string) => {
  const member = await prisma.member.findUnique({
    where: { code },
    include: {
      gym: true,
      memberships: {
        where: { status: 'ACTIVE' },
        include: { discipline: true },
        orderBy: { end_date: 'desc' },
      },
    },
  });

  if (!member) {
    throw new Error('Código inválido');
  }

  if (!member.is_active) {
    throw new Error('Miembro inactivo');
  }

  return member;
};

/**
 * Actualizar member
 */
export const updateMember = async (
  gymId: string,
  memberId: string,
  data: UpdateMemberData
) => {
  // Verificar que el member pertenece al gym
  const member = await prisma.member.findFirst({
    where: {
      id: memberId,
      gym_id: gymId,
    },
  });

  if (!member) {
    throw new Error('Miembro no encontrado');
  }

  // Si se actualiza el teléfono, verificar que no exista
  if (data.phone && data.phone !== member.phone) {
    const existingMember = await prisma.member.findFirst({
      where: {
        gym_id: gymId,
        phone: data.phone,
        id: { not: memberId },
      },
    });

    if (existingMember) {
      throw new Error('Ya existe un miembro con ese teléfono');
    }
  }

  return await prisma.member.update({
    where: { id: memberId },
    data: {
      ...data,
      birth_date: data.birth_date ? new Date(data.birth_date) : undefined,
    },
  });
};

/**
 * Desactivar member
 */
export const deleteMember = async (gymId: string, memberId: string) => {
  const member = await prisma.member.findFirst({
    where: {
      id: memberId,
      gym_id: gymId,
    },
  });

  if (!member) {
    throw new Error('Miembro no encontrado');
  }

  return await prisma.member.update({
    where: { id: memberId },
    data: { is_active: false },
  });
};
