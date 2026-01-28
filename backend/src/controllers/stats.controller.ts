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

/**
 * GET /api/stats/monthly-income-chart
 * Obtener datos de ingresos del mes para gráfica
 */
export const getMonthlyIncomeChart = async (req: Request, res: Response): Promise<void> => {
  try {
    const gymId = req.gymId!;

    const chartData = await statsService.getMonthlyIncomeChart(gymId);

    sendSuccess(res, chartData);
  } catch (error: any) {
    sendServerError(res, error.message);
  }
};

/**
 * GET /api/stats/discipline-distribution
 * Obtener distribución de miembros por disciplina
 */
export const getDisciplineDistribution = async (req: Request, res: Response): Promise<void> => {
  try {
    const gymId = req.gymId!;

    const chartData = await statsService.getDisciplineDistribution(gymId);

    sendSuccess(res, chartData);
  } catch (error: any) {
    sendServerError(res, error.message);
  }
};
