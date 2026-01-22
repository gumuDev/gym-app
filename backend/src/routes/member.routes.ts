import { Router } from 'express';
import * as memberController from '../controllers/member.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { gymMiddleware } from '../middlewares/gym.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { validateMiddleware } from '../middlewares/validate.middleware';
import {
  createMemberSchema,
  updateMemberSchema,
  getMemberByIdSchema,
  getMemberByCodeSchema,
  deleteMemberSchema,
} from '../validators/member.validator';

const router = Router();

// Aplicar middlewares de autenticación
router.use(authMiddleware);
router.use(gymMiddleware);

/**
 * GET /api/members/code/:code
 * Buscar member por código (para QR)
 * NOTA: Esta ruta debe ir ANTES de /:id para que no entre en conflicto
 */
router.get(
  '/code/:code',
  validateMiddleware(getMemberByCodeSchema),
  memberController.getMemberByCode
);

/**
 * GET /api/members
 * Listar members del gym
 */
router.get('/', roleMiddleware(['admin', 'receptionist']), memberController.getMembers);

/**
 * POST /api/members
 * Crear member
 */
router.post(
  '/',
  roleMiddleware(['admin', 'receptionist']),
  validateMiddleware(createMemberSchema),
  memberController.createMember
);

/**
 * GET /api/members/:id
 * Obtener detalle de member
 */
router.get(
  '/:id',
  roleMiddleware(['admin', 'receptionist']),
  validateMiddleware(getMemberByIdSchema),
  memberController.getMemberById
);

/**
 * PATCH /api/members/:id
 * Actualizar member
 */
router.patch(
  '/:id',
  roleMiddleware(['admin', 'receptionist']),
  validateMiddleware(updateMemberSchema),
  memberController.updateMember
);

/**
 * DELETE /api/members/:id
 * Desactivar member
 */
router.delete(
  '/:id',
  roleMiddleware(['admin']),
  validateMiddleware(deleteMemberSchema),
  memberController.deleteMember
);

export default router;
