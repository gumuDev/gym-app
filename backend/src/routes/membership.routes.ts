import { Router } from 'express';
import * as membershipController from '../controllers/membership.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { gymMiddleware } from '../middlewares/gym.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { validateMiddleware } from '../middlewares/validate.middleware';
import {
  createMembershipSchema,
  getMembershipByIdSchema,
  getMembershipsByMemberSchema,
  renewMembershipSchema,
} from '../validators/membership.validator';

const router = Router();

// Aplicar middlewares de autenticación
router.use(authMiddleware);
router.use(gymMiddleware);

/**
 * GET /api/memberships/expiring
 * NOTA: Esta ruta debe ir ANTES de /member/:memberId y /:id
 */
router.get(
  '/expiring',
  roleMiddleware(['admin', 'receptionist']),
  membershipController.getExpiringMemberships
);

/**
 * GET /api/memberships/member/:memberId
 * Permite a admins, recepcionistas y members ver membresías
 */
router.get(
  '/member/:memberId',
  roleMiddleware(['admin', 'receptionist', 'member']),
  validateMiddleware(getMembershipsByMemberSchema),
  membershipController.getMembershipsByMember
);

/**
 * GET /api/memberships
 */
router.get('/', roleMiddleware(['admin', 'receptionist']), membershipController.getMemberships);

/**
 * POST /api/memberships
 */
router.post(
  '/',
  roleMiddleware(['admin', 'receptionist']),
  validateMiddleware(createMembershipSchema),
  membershipController.createMembership
);

/**
 * GET /api/memberships/:id
 */
router.get(
  '/:id',
  roleMiddleware(['admin', 'receptionist']),
  validateMiddleware(getMembershipByIdSchema),
  membershipController.getMembershipById
);

/**
 * POST /api/memberships/:id/renew
 */
router.post(
  '/:id/renew',
  roleMiddleware(['admin', 'receptionist']),
  validateMiddleware(renewMembershipSchema),
  membershipController.renewMembership
);

export default router;
