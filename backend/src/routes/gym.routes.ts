import { Router } from 'express';
import * as gymController from '../controllers/gym.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { gymMiddleware } from '../middlewares/gym.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { validateMiddleware } from '../middlewares/validate.middleware';
import { updateMyGymSchema } from '../validators/gym.validator';

const router = Router();

// Aplicar middlewares de autenticación
router.use(authMiddleware);
router.use(gymMiddleware);

/**
 * GET /api/gyms/me
 * Obtener información del gym actual
 */
router.get('/me', roleMiddleware(['admin']), gymController.getMyGym);

/**
 * PATCH /api/gyms/me
 * Actualizar información del gym actual
 */
router.patch(
  '/me',
  roleMiddleware(['admin']),
  validateMiddleware(updateMyGymSchema),
  gymController.updateMyGym
);

/**
 * POST /api/gyms/me/complete-setup
 * Marcar el setup como completado
 */
router.post('/me/complete-setup', roleMiddleware(['admin']), gymController.completeSetup);

export default router;
