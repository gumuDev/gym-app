import { Request, Response } from 'express';
import * as attendanceService from '../services/attendance.service';
import { sendSuccess, sendError, sendServerError } from '../utils/responseHelpers';

/**
 * POST /api/attendances
 * Registrar asistencia por código QR
 */
export const createAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const gymId = req.gymId!;
    const { member_code, notes } = req.body;

    const result = await attendanceService.createAttendance(gymId, member_code, notes);

    sendSuccess(res, result, 'Asistencia registrada exitosamente', 201);
  } catch (error: any) {
    // Si es un error de asistencia duplicada, devolver 409 con info adicional
    if (error.alreadyRegistered) {
      res.status(409).json({
        success: false,
        error: error.message,
        alreadyRegistered: true,
        registeredAt: error.registeredAt,
        member: error.member,
      });
      return;
    }

    sendError(res, error.message);
  }
};

/**
 * GET /api/attendances
 * Listar asistencias del gym
 */
export const getAttendances = async (req: Request, res: Response): Promise<void> => {
  try {
    const gymId = req.gymId!;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    const attendances = await attendanceService.getAllAttendances(gymId, limit);
    sendSuccess(res, attendances);
  } catch (error: any) {
    sendServerError(res, error.message);
  }
};

/**
 * GET /api/attendances/today
 * Obtener asistencias de hoy
 */
export const getTodayAttendances = async (req: Request, res: Response): Promise<void> => {
  try {
    const gymId = req.gymId!;
    const attendances = await attendanceService.getTodayAttendances(gymId);
    sendSuccess(res, attendances);
  } catch (error: any) {
    sendServerError(res, error.message);
  }
};

/**
 * GET /api/attendances/member/:memberId
 * Obtener asistencias de un member
 */
export const getAttendancesByMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const gymId = req.gymId!;
    const { memberId } = req.params;

    const attendances = await attendanceService.getAttendancesByMember(gymId, memberId);
    sendSuccess(res, attendances);
  } catch (error: any) {
    sendServerError(res, error.message);
  }
};
