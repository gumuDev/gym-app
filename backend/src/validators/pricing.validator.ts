import { z } from 'zod';

/**
 * Validator para crear plan de precios
 */
export const createPricingPlanSchema = z.object({
  body: z.object({
    discipline_id: z.string().uuid('discipline_id debe ser un UUID válido'),
    num_people: z.coerce.number().int().min(1, 'Mínimo 1 persona'),
    num_months: z.coerce.number().int().min(1, 'Mínimo 1 mes'),
    price: z.coerce.number().positive('Precio debe ser positivo'),
  }),
});

/**
 * Validator para actualizar plan de precios
 */
export const updatePricingPlanSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID debe ser un UUID válido'),
  }),
  body: z.object({
    price: z.coerce.number().positive('Precio debe ser positivo'),
  }),
});

/**
 * Validator para calcular precio
 */
export const calculatePriceSchema = z.object({
  query: z.object({
    discipline_id: z.string().uuid('discipline_id debe ser un UUID válido'),
    num_people: z.string().regex(/^\d+$/, 'num_people debe ser un número'),
    num_months: z.string().regex(/^\d+$/, 'num_months debe ser un número'),
  }),
});

/**
 * Validator para obtener/eliminar plan por ID
 */
export const pricingPlanIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID debe ser un UUID válido'),
  }),
});
