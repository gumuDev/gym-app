import { z } from 'zod';

/**
 * Validator para registrar asistencia
 */
export const createAttendanceSchema = z.object({
  body: z.object({
    member_code: z
      .string()
      .regex(/^GYM-[A-F0-9]{6}-\d{3,}$/, 'Código debe tener formato GYM-XXXXXX-001'),
    notes: z.string().optional(),
  }),
});

/**
 * Validator para obtener asistencias de un member
 */
export const getAttendancesByMemberSchema = z.object({
  params: z.object({
    memberId: z.string().uuid('ID debe ser un UUID válido'),
  }),
});
