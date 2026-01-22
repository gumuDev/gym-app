import { Request, Response, NextFunction } from 'express';
import { sendUnauthorized } from '../utils/responseHelpers';

/**
 * Middleware para verificar que el usuario sea super admin
 * Debe usarse después del authMiddleware
 */
export const superAdminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    sendUnauthorized(res, 'Authentication required');
    return;
  }

  if (req.user.role !== 'super_admin') {
    sendUnauthorized(res, 'Super admin access required');
    return;
  }

  next();
};
