import { z } from 'zod';

/**
 * Validator para crear member
 */
export const createMemberSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Nombre debe tener al menos 3 caracteres'),
    email: z.string().email('Email inválido').optional(),
    phone: z.string().min(7, 'Teléfono debe tener al menos 7 caracteres'),
    birth_date: z.string().optional(), // ISO date string
    address: z.string().optional(),
    emergency_contact: z.string().optional(),
    photo_url: z.string().url('URL inválida').optional(),
  }),
});

/**
 * Validator para actualizar member
 */
export const updateMemberSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID debe ser un UUID válido'),
  }),
  body: z.object({
    name: z.string().min(3).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(7).optional(),
    birth_date: z.string().optional(),
    address: z.string().optional(),
    emergency_contact: z.string().optional(),
    photo_url: z.string().url().optional(),
    telegram_chat_id: z.string().optional(),
  }),
});

/**
 * Validator para obtener member por ID
 */
export const getMemberByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID debe ser un UUID válido'),
  }),
});

/**
 * Validator para buscar member por código
 */
export const getMemberByCodeSchema = z.object({
  params: z.object({
    code: z.string().regex(/^GYM-[A-F0-9]{6}-\d{3,}$/, 'Código debe tener formato GYM-XXXXXX-001'),
  }),
});

/**
 * Validator para desactivar member
 */
export const deleteMemberSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID debe ser un UUID válido'),
  }),
});
