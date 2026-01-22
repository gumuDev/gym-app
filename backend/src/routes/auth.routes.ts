import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validateMiddleware } from '../middlewares/validate.middleware';
import {
  loginSchema,
  loginMemberSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.validator';

const router = Router();

/**
 * POST /api/auth/login
 * Login para super admin, admin gym, recepcionista
 */
router.post('/login', validateMiddleware(loginSchema), authController.login);

/**
 * POST /api/auth/login/member
 * Login para members por código
 */
router.post('/login/member', validateMiddleware(loginMemberSchema), authController.loginMember);

/**
 * POST /api/auth/refresh
 * Refrescar token de acceso
 */
router.post('/refresh', validateMiddleware(refreshTokenSchema), authController.refresh);

/**
 * POST /api/auth/forgot-password
 * Solicitar reset de password
 */
router.post(
  '/forgot-password',
  validateMiddleware(forgotPasswordSchema),
  authController.forgotPassword
);

/**
 * POST /api/auth/reset-password
 * Resetear password con token
 */
router.post(
  '/reset-password',
  validateMiddleware(resetPasswordSchema),
  authController.resetPassword
);

export default router;
