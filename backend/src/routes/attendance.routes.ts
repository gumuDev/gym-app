import { Router } from 'express';
import * as attendanceController from '../controllers/attendance.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { gymMiddleware } from '../middlewares/gym.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { validateMiddleware } from '../middlewares/validate.middleware';
import {
  createAttendanceSchema,
  getAttendancesByMemberSchema,
} from '../validators/attendance.validator';

const router = Router();

// Aplicar middlewares de autenticación
router.use(authMiddleware);
router.use(gymMiddleware);

/**
 * GET /api/attendances/today
 * NOTA: Esta ruta debe ir ANTES de /member/:memberId
 */
router.get('/today', roleMiddleware(['admin', 'receptionist']), attendanceController.getTodayAttendances);

/**
 * GET /api/attendances/member/:memberId
 */
router.get(
  '/member/:memberId',
  roleMiddleware(['admin', 'receptionist']),
  validateMiddleware(getAttendancesByMemberSchema),
  attendanceController.getAttendancesByMember
);

/**
 * GET /api/attendances
 */
router.get('/', roleMiddleware(['admin', 'receptionist']), attendanceController.getAttendances);

/**
 * POST /api/attendances
 * Registrar asistencia (scan QR)
 */
router.post(
  '/',
  roleMiddleware(['admin', 'receptionist']),
  validateMiddleware(createAttendanceSchema),
  attendanceController.createAttendance
);

export default router;
