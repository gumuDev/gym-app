import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/responseHelpers';

/**
 * POST /api/auth/login
 * Login para super admin, admin gym, recepcionista
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const result = await authService.loginUser(email, password);

    sendSuccess(res, result, 'Login exitoso');
  } catch (error: any) {
    sendError(res, error.message || 'Error al iniciar sesión', 401);
  }
};

/**
 * POST /api/auth/login/member
 * Login para members por código
 */
export const loginMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.body;

    const result = await authService.loginMember(code);

    sendSuccess(res, result, 'Login exitoso');
  } catch (error: any) {
    sendError(res, error.message || 'Error al iniciar sesión', 401);
  }
};

/**
 * POST /api/auth/refresh
 * Refrescar token de acceso
 */
export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    const result = await authService.refreshAccessToken(refreshToken);

    sendSuccess(res, result, 'Token refrescado');
  } catch (error: any) {
    sendError(res, error.message || 'Error al refrescar token', 401);
  }
};

/**
 * POST /api/auth/forgot-password
 * Solicitar reset de password
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    // TODO: Implementar envío de email con token
    sendSuccess(res, null, 'Email de recuperación enviado (pendiente implementar)');
  } catch (error: any) {
    sendError(res, error.message || 'Error al procesar solicitud');
  }
};

/**
 * POST /api/auth/reset-password
 * Resetear password con token
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    // TODO: Implementar reset de password
    sendSuccess(res, null, 'Password actualizado (pendiente implementar)');
  } catch (error: any) {
    sendError(res, error.message || 'Error al resetear password');
  }
};
