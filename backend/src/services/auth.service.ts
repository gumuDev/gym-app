import { PrismaClient } from '@prisma/client';
import { comparePassword } from '../utils/hash';
import { generateToken, generateRefreshToken, JwtPayload } from '../utils/jwt';

const prisma = new PrismaClient();

interface LoginResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email?: string;
    name: string;
    role: string;
    gymId?: string;
    memberId?: string;
  };
}

/**
 * Login para Super Admin, Admin Gym y Recepcionista
 */
export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
  // Buscar super admin
  const superAdmin = await prisma.superAdmin.findUnique({
    where: { email },
  });

  if (superAdmin) {
    const isValid = await comparePassword(password, superAdmin.password);
    if (!isValid) {
      throw new Error('Credenciales inválidas');
    }

    const payload: JwtPayload = {
      id: superAdmin.id,
      role: 'super_admin',
    };

    return {
      token: generateToken(payload),
      refreshToken: generateRefreshToken(payload),
      user: {
        id: superAdmin.id,
        email: superAdmin.email,
        name: superAdmin.name,
        role: 'super_admin',
      },
    };
  }

  // Buscar user de gym (admin, receptionist, trainer)
  const user = await prisma.user.findFirst({
    where: { email },
    include: { gym: true },
  });

  if (!user) {
    throw new Error('Credenciales inválidas');
  }

  if (!user.is_active) {
    throw new Error('Usuario inactivo');
  }

  if (!user.gym.is_active) {
    throw new Error('Gimnasio suspendido');
  }

  const isValid = await comparePassword(password, user.password);
  if (!isValid) {
    throw new Error('Credenciales inválidas');
  }

  const payload: JwtPayload = {
    id: user.id,
    role: user.role.toLowerCase(),
    gymId: user.gym_id,
  };

  return {
    token: generateToken(payload),
    refreshToken: generateRefreshToken(payload),
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role.toLowerCase(),
      gymId: user.gym_id,
    },
  };
};

/**
 * Login para Members por código
 */
export const loginMember = async (code: string): Promise<LoginResponse> => {
  const member = await prisma.member.findUnique({
    where: { code },
    include: { gym: true },
  });

  if (!member) {
    throw new Error('Código inválido');
  }

  if (!member.is_active) {
    throw new Error('Miembro inactivo');
  }

  if (!member.gym.is_active) {
    throw new Error('Gimnasio suspendido');
  }

  const payload: JwtPayload = {
    id: member.id,
    role: 'member',
    gymId: member.gym_id,
    memberId: member.id,
  };

  return {
    token: generateToken(payload),
    refreshToken: generateRefreshToken(payload),
    user: {
      id: member.id,
      name: member.name,
      role: 'member',
      gymId: member.gym_id,
      memberId: member.id,
    },
  };
};

/**
 * Refrescar token
 */
export const refreshAccessToken = async (refreshToken: string): Promise<{ token: string }> => {
  // TODO: Implementar verificación de refresh token
  // Por ahora, generar nuevo token basado en el refresh token
  throw new Error('Refresh token no implementado aún');
};
