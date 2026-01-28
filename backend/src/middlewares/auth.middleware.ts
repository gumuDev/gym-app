import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { sendUnauthorized } from '../utils/responseHelpers';

// Extender el tipo Request de Express para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Middleware para verificar que el usuario esté autenticado
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendUnauthorized(res, 'No token provided');
      return;
    }

    const token = authHeader.substring(7); // Remover "Bearer "

    const payload = verifyToken(token);

    // Agregar el payload al request
    req.user = payload;

    next();
  } catch (error) {
    sendUnauthorized(res, 'Invalid or expired token');
  }
};
