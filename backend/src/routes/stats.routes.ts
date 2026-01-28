import { Router } from 'express';
import * as statsController from '../controllers/stats.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { gymMiddleware } from '../middlewares/gym.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';

const router = Router();

// Aplicar middlewares de autenticación
router.use(authMiddleware);
router.use(gymMiddleware);

/**
 * GET /api/stats/dashboard
 * Obtener estadísticas del dashboard
 */
router.get('/dashboard', roleMiddleware(['admin', 'receptionist']), statsController.getDashboardStats);

/**
 * GET /api/stats/monthly-income-chart
 * Obtener datos de ingresos del mes para gráfica
 */
router.get('/monthly-income-chart', roleMiddleware(['admin', 'receptionist']), statsController.getMonthlyIncomeChart);

/**
 * GET /api/stats/discipline-distribution
 * Obtener distribución de miembros por disciplina
 */
router.get('/discipline-distribution', roleMiddleware(['admin', 'receptionist']), statsController.getDisciplineDistribution);

export default router;
