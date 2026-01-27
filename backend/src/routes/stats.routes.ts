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

export default router;
