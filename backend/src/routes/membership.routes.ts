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
  createGroupMembershipSchema,
  renewGroupMembershipSchema,
  cancelMembershipSchema,
} from '../validators/membership.validator';

const router = Router();

// Aplicar middlewares de autenticación
router.use(authMiddleware);
router.use(gymMiddleware);

/**
 * GET /api/memberships/stats
 * NOTA: Esta ruta debe ir ANTES de /:id
 */
router.get(
  '/stats',
  roleMiddleware(['admin', 'receptionist']),
  membershipController.getMembershipStats
);

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
 * GET /api/memberships/member/:memberId/active
 * Obtener membresía activa de un miembro
 */
router.get(
  '/member/:memberId/active',
  roleMiddleware(['admin', 'receptionist', 'member']),
  validateMiddleware(getMembershipsByMemberSchema),
  membershipController.getActiveMembershipByMember
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

// ============================================
// RUTAS PARA MEMBRESÍAS GRUPALES
// ============================================

/**
 * POST /api/memberships/group
 * Crear membresía grupal
 */
router.post(
  '/group',
  roleMiddleware(['admin', 'receptionist']),
  validateMiddleware(createGroupMembershipSchema),
  membershipController.createGroupMembership
);

/**
 * POST /api/memberships/:id/renew-group
 * Renovar membresía grupal
 */
router.post(
  '/:id/renew-group',
  roleMiddleware(['admin', 'receptionist']),
  validateMiddleware(renewGroupMembershipSchema),
  membershipController.renewGroupMembership
);

/**
 * DELETE /api/memberships/:id/cancel
 * Cancelar membresía
 */
router.delete(
  '/:id/cancel',
  roleMiddleware(['admin']),
  validateMiddleware(cancelMembershipSchema),
  membershipController.cancelMembership
);

export default router;
