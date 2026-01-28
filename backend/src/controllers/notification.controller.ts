import { Request, Response } from 'express';
import * as notificationService from '../services/notification.service';
import { sendSuccess, sendServerError } from '../utils/responseHelpers';
import { NotificationType, NotificationStatus } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      validatedFilters?: {
        type?: NotificationType;
        status?: NotificationStatus;
        startDate?: Date;
        endDate?: Date;
        page?: number;
        limit?: number;
      };
      gymId?: string;
    }
  }
}
/**
 * GET /api/notifications
 * Listar notificaciones del gym con paginación
 * Query params:
 * - page: número de página (default: 1)
 * - limit: registros por página (default: 5, max: 100)
 * - type: WELCOME | EXPIRING_SOON | EXPIRED
 * - status: SENT | FAILED
 * - startDate: fecha inicial (ISO string)
 * - endDate: fecha final (ISO string)
 */
export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const gymId = req.gymId!;
    const filters = req.validatedFilters;

    const result = await notificationService.getNotificationsByGym(gymId, filters!);
    sendSuccess(res, result);
  } catch (error: any) {
    sendServerError(res, error.message);
  }
};

/**
 * POST /api/notifications/test
 * Ejecutar cron job manualmente (solo para testing)
 */
export const testNotifications = async (_req: Request, res: Response): Promise<void> => {
  try {
    await notificationService.checkExpiringMemberships(true);

    sendSuccess(res, null, 'Verificación de notificaciones ejecutada manualmente');
  } catch (error: any) {
    sendServerError(res, error.message);
  }
};
