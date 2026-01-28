import { Request, Response } from 'express';
import * as pricingService from '../services/pricing.service';
import { sendSuccess, sendError, sendServerError } from '../utils/responseHelpers';

/**
 * GET /api/pricing
 */
export const getPricingPlans = async (req: Request, res: Response): Promise<void> => {
  try {
    const gymId = req.gymId!;
    const plans = await pricingService.getAllPricingPlans(gymId);
    sendSuccess(res, plans);
  } catch (error: any) {
    sendServerError(res, error.message);
  }
};

/**
 * POST /api/pricing
 */
export const createPricingPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const gymId = req.gymId!;
    const plan = await pricingService.createPricingPlan(gymId, req.body);
    sendSuccess(res, plan, 'Plan de precios creado exitosamente', 201);
  } catch (error: any) {
    sendError(res, error.message);
  }
};

/**
 * PATCH /api/pricing/:id
 */
export const updatePricingPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const gymId = req.gymId!;
    const { id } = req.params;
    const { price } = req.body;
    const plan = await pricingService.updatePricingPlan(gymId, id as string, price);
    sendSuccess(res, plan, 'Plan actualizado exitosamente');
  } catch (error: any) {
    sendError(res, error.message);
  }
};

/**
 * DELETE /api/pricing/:id
 */
export const deletePricingPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const gymId = req.gymId!;
    const { id } = req.params;
    await pricingService.deletePricingPlan(gymId, id as string);
    sendSuccess(res, null, 'Plan eliminado exitosamente');
  } catch (error: any) {
    sendError(res, error.message);
  }
};

/**
 * GET /api/pricing/calculate
 */
export const calculatePrice = async (req: Request, res: Response): Promise<void> => {
  try {
    const gymId = req.gymId!;
    const { discipline_id, num_people, num_months } = req.query;

    const result = await pricingService.calculatePrice(
      gymId,
      discipline_id as string,
      parseInt(num_people as string),
      parseInt(num_months as string)
    );

    sendSuccess(res, result);
  } catch (error: any) {
    sendServerError(res, error.message);
  }
};
