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
    const membership = await membershipService.getMembershipById(gymId, id);
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
    const memberships = await membershipService.getMembershipsByMember(gymId, memberId);
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
      id,
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
