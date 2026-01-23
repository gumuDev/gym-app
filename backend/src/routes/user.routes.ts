import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { gymMiddleware } from '../middlewares/gym.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { validateMiddleware } from '../middlewares/validate.middleware';
import {
  createUserSchema,
  updateUserSchema,
  getUserByIdSchema,
  deleteUserSchema,
} from '../validators/user.validator';

const router = Router();

// Aplicar middlewares de autenticación
router.use(authMiddleware);
router.use(gymMiddleware);

/**
 * GET /api/users
 * Listar usuarios del gym
 */
router.get('/', roleMiddleware(['admin']), userController.getAllUsers);

/**
 * GET /api/users/:id
 * Obtener usuario por ID
 */
router.get(
  '/:id',
  roleMiddleware(['admin']),
  validateMiddleware(getUserByIdSchema),
  userController.getUserById
);

/**
 * POST /api/users
 * Crear nuevo usuario (recepcionista o entrenador)
 */
router.post(
  '/',
  roleMiddleware(['admin']),
  validateMiddleware(createUserSchema),
  userController.createUser
);

/**
 * PATCH /api/users/:id
 * Actualizar usuario
 */
router.patch(
  '/:id',
  roleMiddleware(['admin']),
  validateMiddleware(updateUserSchema),
  userController.updateUser
);

/**
 * DELETE /api/users/:id
 * Desactivar usuario
 */
router.delete(
  '/:id',
  roleMiddleware(['admin']),
  validateMiddleware(deleteUserSchema),
  userController.deleteUser
);

/**
 * POST /api/users/:id/activate
 * Activar usuario
 */
router.post('/:id/activate', roleMiddleware(['admin']), userController.activateUser);

export default router;
