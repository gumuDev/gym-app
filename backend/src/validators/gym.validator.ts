import { z } from 'zod';

/**
 * Validator para crear gym
 */
export const createGymSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Nombre debe tener al menos 3 caracteres'),
    email: z.string().email('Email inválido'),
    phone: z.string().optional(),
    address: z.string().optional(),
    adminName: z.string().min(3, 'Nombre del admin debe tener al menos 3 caracteres'),
    adminEmail: z.string().email('Email del admin inválido'),
    adminPassword: z.string().min(6, 'Password debe tener al menos 6 caracteres'),
  }),
});

/**
 * Validator para actualizar gym
 */
export const updateGymSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID debe ser un UUID válido'),
  }),
  body: z.object({
    name: z.string().min(3).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    logo_url: z.string().url().optional(),
    telegram_bot_token: z.string().optional(),
  }),
});

/**
 * Validator para obtener gym por ID
 */
export const getGymByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID debe ser un UUID válido'),
  }),
});

/**
 * Validator para toggle (activar/suspender) gym
 */
export const toggleGymSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID debe ser un UUID válido'),
  }),
});

/**
 * Validator para actualizar el gym actual (admin-gym)
 */
export const updateMyGymSchema = z.object({
  body: z.object({
    name: z.string().min(3).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    logo_url: z.string().url().optional(),
    telegram_bot_token: z.string().optional(),
  }),
});
