import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/hash';
import { CreateUserInput, UpdateUserInput } from '../validators/user.validator';

const prisma = new PrismaClient();

/**
 * Obtener todos los usuarios del gym
 */
export const getAllUsers = async (gymId: string) => {
  const users = await prisma.user.findMany({
    where: { gym_id: gymId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      is_active: true,
      created_at: true,
      updated_at: true,
    },
    orderBy: { created_at: 'desc' },
  });

  return users;
};

/**
 * Obtener usuario por ID
 */
export const getUserById = async (gymId: string, userId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      gym_id: gymId,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      is_active: true,
      created_at: true,
      updated_at: true,
    },
  });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  return user;
};

/**
 * Crear nuevo usuario
 */
export const createUser = async (gymId: string, data: CreateUserInput) => {
  // Verificar si el email ya existe en este gym
  const existingUser = await prisma.user.findFirst({
    where: {
      gym_id: gymId,
      email: data.email,
    },
  });

  if (existingUser) {
    throw new Error('Ya existe un usuario con este email en el gimnasio');
  }

  // Hash password
  const hashedPassword = await hashPassword(data.password);

  // Crear usuario
  const user = await prisma.user.create({
    data: {
      gym_id: gymId,
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role: data.role.toUpperCase() as 'RECEPTIONIST' | 'TRAINER',
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      is_active: true,
      created_at: true,
    },
  });

  return user;
};

/**
 * Actualizar usuario
 */
export const updateUser = async (gymId: string, userId: string, data: UpdateUserInput) => {
  // Verificar que el usuario pertenece al gym
  const existingUser = await prisma.user.findFirst({
    where: {
      id: userId,
      gym_id: gymId,
    },
  });

  if (!existingUser) {
    throw new Error('Usuario no encontrado');
  }

  // Si se actualiza el email, verificar que no esté en uso
  if (data.email && data.email !== existingUser.email) {
    const emailInUse = await prisma.user.findFirst({
      where: {
        gym_id: gymId,
        email: data.email,
        id: { not: userId },
      },
    });

    if (emailInUse) {
      throw new Error('El email ya está en uso por otro usuario');
    }
  }

  // Preparar datos para actualizar
  const updateData: any = {};
  if (data.email) updateData.email = data.email;
  if (data.name) updateData.name = data.name;
  if (data.role) updateData.role = data.role.toUpperCase();
  if (data.password) updateData.password = await hashPassword(data.password);

  // Actualizar usuario
  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      is_active: true,
      updated_at: true,
    },
  });

  return user;
};

/**
 * Desactivar usuario (soft delete)
 */
export const deleteUser = async (gymId: string, userId: string) => {
  // Verificar que el usuario pertenece al gym
  const existingUser = await prisma.user.findFirst({
    where: {
      id: userId,
      gym_id: gymId,
    },
  });

  if (!existingUser) {
    throw new Error('Usuario no encontrado');
  }

  // No permitir desactivar al admin
  if (existingUser.role === 'ADMIN') {
    throw new Error('No se puede desactivar al administrador principal');
  }

  // Desactivar usuario
  const user = await prisma.user.update({
    where: { id: userId },
    data: { is_active: false },
    select: {
      id: true,
      email: true,
      name: true,
      is_active: true,
    },
  });

  return user;
};

/**
 * Activar usuario
 */
export const activateUser = async (gymId: string, userId: string) => {
  // Verificar que el usuario pertenece al gym
  const existingUser = await prisma.user.findFirst({
    where: {
      id: userId,
      gym_id: gymId,
    },
  });

  if (!existingUser) {
    throw new Error('Usuario no encontrado');
  }

  // Activar usuario
  const user = await prisma.user.update({
    where: { id: userId },
    data: { is_active: true },
    select: {
      id: true,
      email: true,
      name: true,
      is_active: true,
    },
  });

  return user;
};
