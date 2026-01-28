import { Request, Response } from 'express';
import * as gymService from '../services/gym.service';
import { sendSuccess, sendServerError } from '../utils/responseHelpers';

/**
 * GET /api/gyms/me
 * Obtener información del gym actual
 */
export const getMyGym = async (req: Request, res: Response): Promise<void> => {
  try {
    const gymId = req.gymId!;
    const gym = await gymService.getMyGym(gymId);
    sendSuccess(res, gym);
  } catch (error: any) {
    sendServerError(res, error.message);
  }
};

/**
 * PATCH /api/gyms/me
 * Actualizar información del gym actual
 */
export const updateMyGym = async (req: Request, res: Response): Promise<void> => {
  try {
    const gymId = req.gymId!;
    const data = req.body;

    const gym = await gymService.updateMyGym(gymId, data);
    sendSuccess(res, gym, 'Gimnasio actualizado exitosamente');
  } catch (error: any) {
    sendServerError(res, error.message);
  }
};

/**
 * POST /api/gyms/me/complete-setup
 * Marcar el setup como completado
 */
export const completeSetup = async (req: Request, res: Response): Promise<void> => {
  try {
    const gymId = req.gymId!;
    const gym = await gymService.completeSetup(gymId);
    sendSuccess(res, gym, 'Setup completado exitosamente');
  } catch (error: any) {
    sendServerError(res, error.message);
  }
};
