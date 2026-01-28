import { Request, Response, NextFunction } from 'express';
import { sendServerError } from '../utils/responseHelpers';

/**
 * Middleware global de manejo de errores
 * Debe ser el último middleware en la cadena
 */
export const errorMiddleware = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('❌ Error:', error);

  // Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    sendServerError(res, 'Database error');
    return;
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
    });
    return;
  }

  // Error genérico
  sendServerError(res, error.message || 'Internal server error');
};
