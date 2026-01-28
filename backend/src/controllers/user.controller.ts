import { Request, Response } from 'express';
import * as userService from '../services/user.service';
import { sendSuccess, sendError, sendServerError } from '../utils/responseHelpers';

/**
 * GET /api/users
 * Obtener todos los usuarios del gym
 */
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const gymId = req.gymId!;
    const users = await userService.getAllUsers(gymId);
    sendSuccess(res, users);
  } catch (error: any) {
    sendServerError(res, error.message);
  }
};

/**
 * GET /api/users/:id
 * Obtener un usuario por ID
 */
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const gymId = req.gymId!;
    const { id } = req.params;
    const user = await userService.getUserById(gymId, id as string);
    sendSuccess(res, user);
  } catch (error: any) {
    sendError(res, error.message);
  }
};

/**
 * POST /api/users
 * Crear un nuevo usuario
 */
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const gymId = req.gymId!;
    const data = req.body;
    const user = await userService.createUser(gymId, data);
    sendSuccess(res, user, 'Usuario creado exitosamente', 201);
  } catch (error: any) {
    sendError(res, error.message);
  }
};

/**
 * PATCH /api/users/:id
 * Actualizar un usuario
 */
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const gymId = req.gymId!;
    const { id } = req.params;
    const data = req.body;
    const user = await userService.updateUser(gymId, id as string, data);
    sendSuccess(res, user, 'Usuario actualizado exitosamente');
  } catch (error: any) {
    sendError(res, error.message);
  }
};

/**
 * DELETE /api/users/:id
 * Desactivar un usuario
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const gymId = req.gymId!;
    const { id } = req.params;
    const user = await userService.deleteUser(gymId, id as string);
    sendSuccess(res, user, 'Usuario desactivado exitosamente');
  } catch (error: any) {
    sendError(res, error.message);
  }
};

/**
 * POST /api/users/:id/activate
 * Activar un usuario
 */
export const activateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const gymId = req.gymId!;
    const { id } = req.params;
    const user = await userService.activateUser(gymId, id as string);
    sendSuccess(res, user, 'Usuario activado exitosamente');
  } catch (error: any) {
    sendError(res, error.message);
  }
};
