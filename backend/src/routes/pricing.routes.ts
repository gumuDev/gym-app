import { Router } from 'express';
import * as pricingController from '../controllers/pricing.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { gymMiddleware } from '../middlewares/gym.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { validateMiddleware } from '../middlewares/validate.middleware';
import {
  createPricingPlanSchema,
  updatePricingPlanSchema,
  calculatePriceSchema,
  pricingPlanIdSchema,
} from '../validators/pricing.validator';

const router = Router();

// Aplicar middlewares de autenticación
router.use(authMiddleware);
router.use(gymMiddleware);
router.use(roleMiddleware(['admin']));

/**
 * GET /api/pricing/calculate
 * NOTA: Esta ruta debe ir ANTES de /:id
 */
router.get('/calculate', validateMiddleware(calculatePriceSchema), pricingController.calculatePrice);

/**
 * GET /api/pricing
 */
router.get('/', pricingController.getPricingPlans);

/**
 * POST /api/pricing
 */
router.post('/', validateMiddleware(createPricingPlanSchema), pricingController.createPricingPlan);

/**
 * PATCH /api/pricing/:id
 */
router.patch(
  '/:id',
  validateMiddleware(updatePricingPlanSchema),
  pricingController.updatePricingPlan
);

/**
 * DELETE /api/pricing/:id
 */
router.delete(
  '/:id',
  validateMiddleware(pricingPlanIdSchema),
  pricingController.deletePricingPlan
);

export default router;
