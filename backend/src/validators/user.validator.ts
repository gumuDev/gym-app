import { z } from 'zod';

/**
 * Validator para crear usuario
 */
export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    role: z.enum(['receptionist', 'trainer'], {
      errorMap: () => ({ message: 'El rol debe ser receptionist o trainer' }),
    }),
  }),
});

/**
 * Validator para actualizar usuario
 */
export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID debe ser un UUID válido'),
  }),
  body: z.object({
    email: z.string().email('Email inválido').optional(),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional(),
    name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').optional(),
    role: z.enum(['receptionist', 'trainer']).optional(),
  }),
});

/**
 * Validator para obtener usuario por ID
 */
export const getUserByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID debe ser un UUID válido'),
  }),
});

/**
 * Validator para desactivar usuario
 */
export const deleteUserSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID debe ser un UUID válido'),
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>['body'];
export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];
