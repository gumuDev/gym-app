import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

/**
 * Envía una respuesta exitosa
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };

  return res.status(statusCode).json(response);
};

/**
 * Envía una respuesta de error
 */
export const sendError = (
  res: Response,
  error: string,
  statusCode: number = 400
): Response => {
  const response: ApiResponse = {
    success: false,
    error,
  };

  return res.status(statusCode).json(response);
};

/**
 * Envía una respuesta de error de validación
 */
export const sendValidationError = (res: Response, errors: any): Response => {
  return res.status(422).json({
    success: false,
    error: 'Validation failed',
    details: errors,
  });
};

/**
 * Envía una respuesta de no autorizado
 */
export const sendUnauthorized = (res: Response, message?: string): Response => {
  return sendError(res, message || 'Unauthorized', 401);
};

/**
 * Envía una respuesta de no encontrado
 */
export const sendNotFound = (res: Response, message?: string): Response => {
  return sendError(res, message || 'Resource not found', 404);
};

/**
 * Envía una respuesta de error del servidor
 */
export const sendServerError = (res: Response, error?: string): Response => {
  return sendError(res, error || 'Internal server error', 500);
};
