import { Request, Response, NextFunction } from 'express';
import { sendUnauthorized } from '../utils/responseHelpers';

/**
 * Middleware para verificar que el usuario tenga uno de los roles permitidos
 * Debe usarse después del authMiddleware
 */
export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendUnauthorized(res, 'Authentication required');
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendUnauthorized(res, 'Insufficient permissions');
      return;
    }

    next();
  };
};
