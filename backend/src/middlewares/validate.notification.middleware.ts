// middlewares/validateNotificationQuery.ts
import { Request, Response, NextFunction } from 'express';
import { NotificationType, NotificationStatus } from '@prisma/client';

// Opcional: crear arrays de valores válidos (Prisma genera estos enums como objetos)
const VALID_NOTIFICATION_TYPES = Object.values(NotificationType);
const VALID_NOTIFICATION_STATUSES = Object.values(NotificationStatus);

export const validateNotificationQuery = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { type, status, startDate, endDate, page, limit } = req.query;
  const filters: {
    type?: NotificationType;
    status?: NotificationStatus;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  } = {};

  // Validar type
  if (type) {
    if (!VALID_NOTIFICATION_TYPES.includes(type as NotificationType)) {
      return res.status(400).json({
        error: `Invalid 'type'. Must be one of: ${VALID_NOTIFICATION_TYPES.join(', ')}`,
      });
    }
    filters.type = type as NotificationType;
  }

  // Validar status
  if (status) {
    if (!VALID_NOTIFICATION_STATUSES.includes(status as NotificationStatus)) {
      return res.status(400).json({
        error: `Invalid 'status'. Must be one of: ${VALID_NOTIFICATION_STATUSES.join(', ')}`,
      });
    }
    filters.status = status as NotificationStatus;
  }

  // Fechas
  if (startDate) {
    const start = new Date(startDate as string);
    if (isNaN(start.getTime())) {
      return res.status(400).json({ error: 'Invalid startDate format' });
    }
    filters.startDate = start;
  }

  if (endDate) {
    const end = new Date(endDate as string);
    if (isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid endDate format' });
    }
    filters.endDate = end;
  }

  // Paginación
  if (page) {
    const pageNum = parseInt(page as string, 10);
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({ error: 'Page must be a positive integer' });
    }
    filters.page = pageNum;
  }

  if (limit) {
    const limitNum = parseInt(limit as string, 10);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({ error: 'Limit must be between 1 and 100' });
    }
    filters.limit = limitNum;
  }

  (req as any).validatedFilters = filters;
  return next();
};