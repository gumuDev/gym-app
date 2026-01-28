import { Request, Response } from 'express';
import * as memberService from '../services/member.service';
import { sendSuccess, sendError, sendNotFound, sendServerError } from '../utils/responseHelpers';

/**
 * GET /api/members
 * Listar members del gym con paginación y filtros
 * Query params: page, limit, search
 */
export const getMembers = async (req: Request, res: Response): Promise<void> => {
  try {
    const gymId = req.gymId!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const result = await memberService.getAllMembers({ gymId, page, limit, search });
    sendSuccess(res, result);
  } catch (error: any) {
    sendServerError(res, error.message);
  }
};

/**
 * POST /api/members
 * Crear member
 */
export const createMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const gymId = req.gymId!;
    const member = await memberService.createMember(gymId, req.body);
    sendSuccess(res, member, 'Miembro creado exitosamente', 201);
  } catch (error: any) {
    sendError(res, error.message);
  }
};

/**
 * GET /api/members/:id
 * Obtener detalle de member
 */
export const getMemberById = async (req: Request, res: Response): Promise<void> => {
  try {
    const gymId = req.gymId!;
    const { id } = req.params;
    const member = await memberService.getMemberById(gymId, id);
    sendSuccess(res, member);
  } catch (error: any) {
    sendNotFound(res, error.message);
  }
};

/**
 * GET /api/members/code/:code
 * Buscar member por código (para QR)
 */
export const getMemberByCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.params;
    const member = await memberService.getMemberByCode(code);
    sendSuccess(res, member);
  } catch (error: any) {
    sendNotFound(res, error.message);
  }
};

/**
 * PATCH /api/members/:id
 * Actualizar member
 */
export const updateMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const gymId = req.gymId!;
    const { id } = req.params;
    const member = await memberService.updateMember(gymId, id, req.body);
    sendSuccess(res, member, 'Miembro actualizado exitosamente');
  } catch (error: any) {
    sendError(res, error.message);
  }
};

/**
 * DELETE /api/members/:id
 * Desactivar member
 */
export const deleteMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const gymId = req.gymId!;
    const { id } = req.params;
    const member = await memberService.deleteMember(gymId, id);
    sendSuccess(res, member, 'Miembro desactivado exitosamente');
  } catch (error: any) {
    sendError(res, error.message);
  }
};
