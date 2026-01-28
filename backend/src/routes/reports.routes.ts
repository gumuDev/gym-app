import { Router } from 'express';
import * as reportsController from '../controllers/reports.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { gymMiddleware } from '../middlewares/gym.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';

const router = Router();

// Aplicar middlewares de autenticación
router.use(authMiddleware);
router.use(gymMiddleware);

/**
 * GET /api/reports/income
 * Obtener reporte de ingresos
 * Acceso: admin, receptionist
 */
router.get(
  '/income',
  roleMiddleware(['admin', 'receptionist']),
  reportsController.getIncomeReport
);

/**
 * GET /api/reports/attendance
 * Obtener reporte de asistencias
 * Acceso: admin, receptionist
 */
router.get(
  '/attendance',
  roleMiddleware(['admin', 'receptionist']),
  reportsController.getAttendanceReport
);

/**
 * GET /api/reports/members
 * Obtener reporte de members
 * Acceso: admin, receptionist
 */
router.get(
  '/members',
  roleMiddleware(['admin', 'receptionist']),
  reportsController.getMembersReport
);

export default router;
