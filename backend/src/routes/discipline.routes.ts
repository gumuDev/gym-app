import { Router } from 'express';
import * as disciplineController from '../controllers/discipline.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { gymMiddleware } from '../middlewares/gym.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { validateMiddleware } from '../middlewares/validate.middleware';
import {
  createDisciplineSchema,
  updateDisciplineSchema,
  disciplineIdSchema,
} from '../validators/discipline.validator';

const router = Router();

// Aplicar middlewares de autenticación
router.use(authMiddleware);
router.use(gymMiddleware);
router.use(roleMiddleware(['admin']));

/**
 * GET /api/disciplines
 */
router.get('/', disciplineController.getDisciplines);

/**
 * POST /api/disciplines
 */
router.post('/', validateMiddleware(createDisciplineSchema), disciplineController.createDiscipline);

/**
 * PATCH /api/disciplines/:id
 */
router.patch(
  '/:id',
  validateMiddleware(updateDisciplineSchema),
  disciplineController.updateDiscipline
);

/**
 * DELETE /api/disciplines/:id
 */
router.delete(
  '/:id',
  validateMiddleware(disciplineIdSchema),
  disciplineController.deleteDiscipline
);

export default router;
