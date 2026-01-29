import { Request, Response } from 'express';
import * as membershipService from '../services/membership.service';
import { sendSuccess, sendError, sendNotFound, sendServerError } from '../utils/responseHelpers';

/**
 * GET /api/memberships
 */
export const getMemberships = async (req: Request, res: Response): Promise<void> => {
  try {
    const gymId = req.gymId!;
    const memberships = await membershipService.getAllMemberships(gymId);
    sendSuccess(res, memberships);
  } catch (error: any) {
    sendServerError(res, error.message);
  }
};

/**
 * POST /api/memberships
 */
export const createMembership = async (req: Request, res: Response): Promise<void> => {
  try {
    const gymId = req.gymId!;
    const membership = await membershipService.createMembership(gymId, req.body);
    sendSuccess(res, membership, 'Membresía creada exitosamente', 201);
  } catch (error: any) {
    sendError(res, error.message);
  }
};

/**
 * GET /api/memberships/:id
 */
export const getMembershipById = async (req: Request, res: Response): Promise<void> => {
  try {
    const gymId = req.gymId!;
    const { id } = req.params;
    const membership = await membershipService.getMembershipById(gymId, id as string);
    sendSuccess(res, membership);
  } catch (error: any) {
    sendNotFound(res, error.message);
  }
};

/**
 * GET /api/memberships/member/:memberId
 */
export const getMembershipsByMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const gymId = req.gymId!;
    const { memberId } = req.params;
    const memberships = await membershipService.getMembershipsByMember(gymId, memberId as string);
    sendSuccess(res, memberships);
  } catch (error: any) {
    sendServerError(res, error.message);
  }
};

/**
 * GET /api/memberships/expiring
 */
export const getExpiringMemberships = async (req: Request, res: Response): Promise<void> => {
  try {
    const gymId = req.gymId!;
    const memberships = await membershipService.getExpiringMemberships(gymId);
    sendSuccess(res, memberships);
  } catch (error: any) {
    sendServerError(res, error.message);
  }
};

/**
 * POST /api/memberships/:id/renew
 */
export const renewMembership = async (req: Request, res: Response): Promise<void> => {
  try {
    const gymId = req.gymId!;
    const { id } = req.params;
    const { num_months, amount_paid, payment_method, notes } = req.body;

    const membership = await membershipService.renewMembership(
      gymId,
      id as string,
      num_months,
      amount_paid,
      payment_method,
      notes
    );

    sendSuccess(res, membership, 'Membresía renovada exitosamente');
  } catch (error: any) {
    sendError(res, error.message);
  }
};

// ============================================
// NUEVOS ENDPOINTS PARA MEMBRESÍAS GRUPALES
// ============================================

/**
 * POST /api/memberships/group
 * Crear membresía grupal
 */
export const createGroupMembership = async (req: Request, res: Response): Promise<void> => {
  try {
    const gymId = req.gymId!;
    const membership = await membershipService.createGroupMembership(gymId, req.body);
    sendSuccess(res, membership, 'Membresía grupal creada exitosamente', 201);
  } catch (error: any) {
    sendError(res, error.message);
  }
};

/**
 * POST /api/memberships/:id/renew-group
 * Renovar membresía grupal
 */
export const renewGroupMembership = async (req: Request, res: Response): Promise<void> => {
  try {
    const gymId = req.gymId!;
    const { id } = req.params;
    const membership = await membershipService.renewGroupMembership(gymId, id as string, req.body);
    sendSuccess(res, membership, 'Membresía grupal renovada exitosamente');
  } catch (error: any) {
    sendError(res, error.message);
  }
};

/**
 * GET /api/memberships/member/:memberId/active
 * Obtener membresía activa de un miembro
 */
export const getActiveMembershipByMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const gymId = req.gymId!;
    const { memberId } = req.params;
    const membership = await membershipService.getActiveMembershipByMember(gymId, memberId as string);

    if (!membership) {
      sendNotFound(res, 'El miembro no tiene membresía activa');
      return;
    }

    sendSuccess(res, membership);
  } catch (error: any) {
    sendServerError(res, error.message);
  }
};

/**
 * DELETE /api/memberships/:id/cancel
 * Cancelar membresía
 */
export const cancelMembership = async (req: Request, res: Response): Promise<void> => {
  try {
    const gymId = req.gymId!;
    const { id } = req.params;
    const { reason } = req.body;

    const membership = await membershipService.cancelMembership(gymId, id as string, reason);
    sendSuccess(res, membership, 'Membresía cancelada exitosamente');
  } catch (error: any) {
    sendError(res, error.message);
  }
};

/**
 * GET /api/memberships/stats
 * Obtener estadísticas de membresías
 */
export const getMembershipStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const gymId = req.gymId!;
    const stats = await membershipService.getMembershipStats(gymId);
    sendSuccess(res, stats);
  } catch (error: any) {
    sendServerError(res, error.message);
  }
};
