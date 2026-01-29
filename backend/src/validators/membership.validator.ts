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

// ============================================
// VALIDATORS PARA MEMBRESÍAS GRUPALES
// ============================================

/**
 * Validator para crear membresía grupal
 */
export const createGroupMembershipSchema = z.object({
  body: z.object({
    disciplineId: z.string().uuid('disciplineId debe ser un UUID válido'),
    pricingPlanId: z.string().uuid('pricingPlanId debe ser un UUID válido'),
    members: z
      .array(
        z.object({
          memberId: z.string().uuid('memberId debe ser un UUID válido'),
          isPrimary: z.boolean().optional(),
        })
      )
      .min(1, 'Debe haber al menos un miembro')
      .max(10, 'Máximo 10 miembros por membresía'),
    paymentMethod: z.string().optional(),
    notes: z.string().optional(),
  }),
});

/**
 * Validator para renovar membresía grupal
 */
export const renewGroupMembershipSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID debe ser un UUID válido'),
  }),
  body: z.object({
    memberIds: z
      .array(z.string().uuid('Cada memberId debe ser un UUID válido'))
      .min(1, 'Debe haber al menos un miembro')
      .max(10, 'Máximo 10 miembros por membresía'),
    pricingPlanId: z.string().uuid('pricingPlanId debe ser un UUID válido'),
    paymentMethod: z.string().optional(),
    notes: z.string().optional(),
  }),
});

/**
 * Validator para cancelar membresía
 */
export const cancelMembershipSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID debe ser un UUID válido'),
  }),
  body: z.object({
    reason: z.string().optional(),
  }),
});
