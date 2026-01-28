import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny, ZodError } from 'zod';
import { sendValidationError } from '../utils/responseHelpers';

/**
 * Middleware para validar el body, query o params con Zod
 */
export const validateMiddleware = (schema: ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = (error.issues || []).map(err => ({
          path: err.path.join('.'),
          message: err.message,
        }));

        sendValidationError(res, formattedErrors);
        return;
      }

      // Error inesperado en validación
      console.error('Validation middleware error:', error);
      next(error);
    }
  };
};
