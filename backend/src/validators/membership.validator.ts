import { z } from 'zod';

/**
 * Validator para crear membresía
 */
export const createMembershipSchema = z.object({
  body: z.object({
    member_id: z.string().uuid('member_id debe ser un UUID válido'),
    discipline_id: z.string().uuid('discipline_id debe ser un UUID válido'),
    start_date: z.string(), // ISO date string
    end_date: z.string(), // ISO date string
    amount_paid: z.number().positive('Monto debe ser positivo'),
    payment_method: z.string().optional(),
    notes: z.string().optional(),
  }),
});

/**
 * Validator para obtener membresía por ID
 */
export const getMembershipByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID debe ser un UUID válido'),
  }),
});

/**
 * Validator para obtener membresías de un member
 */
export const getMembershipsByMemberSchema = z.object({
  params: z.object({
    memberId: z.string().uuid('memberId debe ser un UUID válido'),
  }),
});

/**
 * Validator para renovar membresía
 */
export const renewMembershipSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID debe ser un UUID válido'),
  }),
  body: z.object({
    num_months: z.number().int().min(1, 'Mínimo 1 mes'),
    amount_paid: z.number().positive('Monto debe ser positivo'),
    payment_method: z.string().optional(),
    notes: z.string().optional(),
  }),
});
