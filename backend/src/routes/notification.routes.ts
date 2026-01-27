import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { gymMiddleware } from '../middlewares/gym.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { validateNotificationQuery } from '../middlewares/validate.notification.middleware';

const router = Router();

// Aplicar middlewares de autenticación
router.use(authMiddleware);
router.use(validateNotificationQuery);
router.use(gymMiddleware);

/**
 * GET /api/notifications
 * Listar notificaciones del gym
 */
router.get('/', roleMiddleware(['admin', 'receptionist']), notificationController.getNotifications);

/**
 * POST /api/notifications/test
 * Ejecutar cron job manualmente (solo para testing)
 */
router.post('/test', roleMiddleware(['admin']), notificationController.testNotifications);

export default router;
