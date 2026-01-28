import { Request, Response, NextFunction } from 'express';
import { sendUnauthorized } from '../utils/responseHelpers';

declare global {
  namespace Express {
    interface Request {
      gymId?: string;
    }
  }
}

/**
 * Middleware para extraer gymId del JWT y agregarlo al request
 * Debe usarse después del authMiddleware
 * Asegura que todas las queries filtren por gym_id
 */
export const gymMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    sendUnauthorized(res, 'Authentication required');
    return;
  }

  // Super admin no tiene gymId
  if (req.user.role === 'super_admin') {
    next();
    return;
  }

  // Los demás roles deben tener gymId
  if (!req.user.gymId) {
    sendUnauthorized(res, 'Invalid token: gymId missing');
    return;
  }

  // Agregar gymId al request para usarlo en los controllers
  req.gymId = req.user.gymId;

  next();
};
