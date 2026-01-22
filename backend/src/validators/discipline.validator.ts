import { z } from 'zod';

/**
 * Validator para crear disciplina
 */
export const createDisciplineSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Nombre debe tener al menos 3 caracteres'),
    description: z.string().optional(),
  }),
});

/**
 * Validator para actualizar disciplina
 */
export const updateDisciplineSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID debe ser un UUID válido'),
  }),
  body: z.object({
    name: z.string().min(3).optional(),
    description: z.string().optional(),
  }),
});

/**
 * Validator para obtener/eliminar disciplina por ID
 */
export const disciplineIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID debe ser un UUID válido'),
  }),
});
