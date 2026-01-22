import { Request, Response } from 'express';
import * as superAdminService from '../services/superAdmin.service';
import { sendSuccess, sendError, sendServerError } from '../utils/responseHelpers';

/**
 * GET /api/super-admin/dashboard
 * Obtener métricas del dashboard
 */
export const getDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const metrics = await superAdminService.getDashboardMetrics();
    sendSuccess(res, metrics);
  } catch (error: any) {
    sendServerError(res, error.message);
  }
};

/**
 * GET /api/super-admin/gyms
 * Listar todos los gimnasios
 */
export const getGyms = async (req: Request, res: Response): Promise<void> => {
  try {
    const gyms = await superAdminService.getAllGyms();
    sendSuccess(res, gyms);
  } catch (error: any) {
    sendServerError(res, error.message);
  }
};

/**
 * GET /api/super-admin/gyms/:id
 * Obtener detalle de un gimnasio
 */
export const getGymById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const gym = await superAdminService.getGymById(id);
    sendSuccess(res, gym);
  } catch (error: any) {
    sendError(res, error.message, 404);
  }
};

/**
 * POST /api/super-admin/gyms
 * Crear nuevo gimnasio + admin
 */
export const createGym = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await superAdminService.createGym(req.body);
    sendSuccess(res, result, 'Gimnasio creado exitosamente', 201);
  } catch (error: any) {
    sendError(res, error.message);
  }
};

/**
 * PATCH /api/super-admin/gyms/:id
 * Actualizar gimnasio
 */
export const updateGym = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const gym = await superAdminService.updateGym(id, req.body);
    sendSuccess(res, gym, 'Gimnasio actualizado exitosamente');
  } catch (error: any) {
    sendError(res, error.message);
  }
};

/**
 * POST /api/super-admin/gyms/:id/toggle
 * Activar/Suspender gimnasio
 */
export const toggleGym = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const gym = await superAdminService.toggleGymStatus(id);
    const message = gym.is_active ? 'Gimnasio activado' : 'Gimnasio suspendido';
    sendSuccess(res, gym, message);
  } catch (error: any) {
    sendError(res, error.message);
  }
};

/**
 * GET /api/super-admin/invoices
 * Listar todas las facturas
 */
export const getInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    const invoices = await superAdminService.getAllInvoices();
    sendSuccess(res, invoices);
  } catch (error: any) {
    sendServerError(res, error.message);
  }
};

/**
 * POST /api/super-admin/invoices/generate
 * Generar facturas mensuales
 */
export const generateInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    const invoices = await superAdminService.generateMonthlyInvoices();
    sendSuccess(res, invoices, `${invoices.length} facturas generadas exitosamente`);
  } catch (error: any) {
    sendServerError(res, error.message);
  }
};
