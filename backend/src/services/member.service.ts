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

interface GetAllMembersParams {
  gymId: string;
  page?: number;
  limit?: number;
  search?: string;
}

/**
 * Listar members del gym con paginación y filtros
 */
export const getAllMembers = async ({ gymId, page = 1, limit = 10, search }: GetAllMembersParams) => {
  // Validar parámetros
  const currentPage = Math.max(1, page);
  const itemsPerPage = Math.min(Math.max(1, limit), 100); // Máximo 100
  const skip = (currentPage - 1) * itemsPerPage;

  // Construir filtro de búsqueda
  const where: any = { gym_id: gymId };

  if (search && search.trim()) {
    where.OR = [
      { name: { contains: search.trim(), mode: 'insensitive' } },
      { email: { contains: search.trim(), mode: 'insensitive' } },
      { phone: { contains: search.trim(), mode: 'insensitive' } },
      { code: { contains: search.trim(), mode: 'insensitive' } },
    ];
  }

  // Obtener total de registros
  const total = await prisma.member.count({ where });

  // Obtener members paginados
  const members = await prisma.member.findMany({
    where,
    orderBy: { created_at: 'desc' },
    skip,
    take: itemsPerPage,
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

  // Calcular metadata de paginación
  const totalPages = Math.ceil(total / itemsPerPage);
  const hasMore = currentPage < totalPages;
  const hasPrevious = currentPage > 1;

  return {
    data: members,
    pagination: {
      total,
      page: currentPage,
      limit: itemsPerPage,
      totalPages,
      hasMore,
      hasPrevious,
    },
  };
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
