import { Request, Response } from 'express';
import * as reportsService from '../services/reports.service';
import { sendSuccess, sendServerError } from '../utils/responseHelpers';

/**
 * GET /api/reports/income
 * Obtener reporte de ingresos
 * Query params:
 * - startDate: fecha inicial (ISO string)
 * - endDate: fecha final (ISO string)
 * - disciplineId: (opcional) filtrar por disciplina
 */
export const getIncomeReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const gymId = req.gymId!;
    const { startDate, endDate, disciplineId } = req.query;

    // Validar fechas
    if (!startDate || !endDate) {
      res.status(400).json({
        success: false,
        message: 'Se requieren startDate y endDate',
      });
      return;
    }

    const filters: reportsService.IncomeReportFilters = {
      startDate: new Date(startDate as string),
      endDate: new Date(endDate as string),
    };

    if (disciplineId) {
      filters.disciplineId = disciplineId as string;
    }

    const report = await reportsService.getIncomeReport(gymId, filters);

    sendSuccess(res, report);
  } catch (error: any) {
    sendServerError(res, error.message);
  }
};

/**
 * GET /api/reports/attendance
 * Obtener reporte de asistencias
 * Query params:
 * - startDate: fecha inicial (ISO string)
 * - endDate: fecha final (ISO string)
 * - memberId: (opcional) filtrar por member
 */
export const getAttendanceReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const gymId = req.gymId!;
    const { startDate, endDate, memberId } = req.query;

    // Validar fechas
    if (!startDate || !endDate) {
      res.status(400).json({
        success: false,
        message: 'Se requieren startDate y endDate',
      });
      return;
    }

    const filters: reportsService.AttendanceReportFilters = {
      startDate: new Date(startDate as string),
      endDate: new Date(endDate as string),
    };

    if (memberId) {
      filters.memberId = memberId as string;
    }

    const report = await reportsService.getAttendanceReport(gymId, filters);

    sendSuccess(res, report);
  } catch (error: any) {
    sendServerError(res, error.message);
  }
};

/**
 * GET /api/reports/members
 * Obtener reporte de members
 * Query params:
 * - startDate: fecha inicial (ISO string)
 * - endDate: fecha final (ISO string)
 */
export const getMembersReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const gymId = req.gymId!;
    const { startDate, endDate } = req.query;

    // Validar fechas
    if (!startDate || !endDate) {
      res.status(400).json({
        success: false,
        message: 'Se requieren startDate y endDate',
      });
      return;
    }

    const filters: reportsService.MembersReportFilters = {
      startDate: new Date(startDate as string),
      endDate: new Date(endDate as string),
    };

    const report = await reportsService.getMembersReport(gymId, filters);

    sendSuccess(res, report);
  } catch (error: any) {
    sendServerError(res, error.message);
  }
};
