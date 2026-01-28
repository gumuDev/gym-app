import { Request, Response } from 'express';
import * as disciplineService from '../services/discipline.service';
import { sendSuccess, sendError, sendServerError } from '../utils/responseHelpers';

/**
 * GET /api/disciplines
 */
export const getDisciplines = async (req: Request, res: Response): Promise<void> => {
  try {
    const gymId = req.gymId!;
    const disciplines = await disciplineService.getAllDisciplines(gymId);
    sendSuccess(res, disciplines);
  } catch (error: any) {
    sendServerError(res, error.message);
  }
};

/**
 * POST /api/disciplines
 */
export const createDiscipline = async (req: Request, res: Response): Promise<void> => {
  try {
    const gymId = req.gymId!;
    const discipline = await disciplineService.createDiscipline(gymId, req.body);
    sendSuccess(res, discipline, 'Disciplina creada exitosamente', 201);
  } catch (error: any) {
    sendError(res, error.message);
  }
};

/**
 * PATCH /api/disciplines/:id
 */
export const updateDiscipline = async (req: Request, res: Response): Promise<void> => {
  try {
    const gymId = req.gymId!;
    const { id } = req.params;
    const discipline = await disciplineService.updateDiscipline(gymId, id as string, req.body);
    sendSuccess(res, discipline, 'Disciplina actualizada exitosamente');
  } catch (error: any) {
    sendError(res, error.message);
  }
};

/**
 * DELETE /api/disciplines/:id
 */
export const deleteDiscipline = async (req: Request, res: Response): Promise<void> => {
  try {
    const gymId = req.gymId!;
    const { id } = req.params;
    const discipline = await disciplineService.deleteDiscipline(gymId, id as string);
    sendSuccess(res, discipline, 'Disciplina desactivada exitosamente');
  } catch (error: any) {
    sendError(res, error.message);
  }
};
