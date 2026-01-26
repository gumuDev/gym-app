import { z } from 'zod';

/**
 * Validator para login de super admin, admin gym, recepcionista
 */
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Password debe tener al menos 6 caracteres'),
  }),
});

/**
 * Validator para login de members por código o teléfono
 */
export const loginMemberSchema = z.object({
  body: z.object({
    code: z
      .string()
      .regex(/^GYM-[A-F0-9]{6}-\d{3,}$/, 'Código debe tener formato GYM-XXXXXX-001')
      .optional(),
    phone: z.string().min(1, 'Teléfono requerido').optional(),
  }).refine((data) => data.code || data.phone, {
    message: 'Debes proporcionar código o teléfono',
  }),
});

/**
 * Validator para refresh token
 */
export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token requerido'),
  }),
});

/**
 * Validator para forgot password
 */
export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Email inválido'),
  }),
});

/**
 * Validator para reset password
 */
export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token requerido'),
    newPassword: z.string().min(6, 'Password debe tener al menos 6 caracteres'),
  }),
});
