import { Request, Response } from 'express';
import * as statsService from '../services/stats.service';
import { sendSuccess, sendServerError } from '../utils/responseHelpers';

/**
 * GET /api/stats/dashboard
 * Obtener estadísticas del dashboard
 */
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const gymId = req.gymId!;

    const stats = await statsService.getDashboardStats(gymId);

    sendSuccess(res, stats);
  } catch (error: any) {
    sendServerError(res, error.message);
  }
};
