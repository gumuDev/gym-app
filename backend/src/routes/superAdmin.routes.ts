import { Router } from 'express';
import * as superAdminController from '../controllers/superAdmin.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { superAdminMiddleware } from '../middlewares/superAdmin.middleware';
import { validateMiddleware } from '../middlewares/validate.middleware';
import {
  createGymSchema,
  updateGymSchema,
  getGymByIdSchema,
  toggleGymSchema,
} from '../validators/gym.validator';

const router = Router();

// Aplicar middlewares de autenticación y super admin a todas las rutas
router.use(authMiddleware);
router.use(superAdminMiddleware);

/**
 * GET /api/super-admin/dashboard
 * Obtener métricas del dashboard
 */
router.get('/dashboard', superAdminController.getDashboard);

/**
 * GET /api/super-admin/gyms
 * Listar todos los gimnasios
 */
router.get('/gyms', superAdminController.getGyms);

/**
 * GET /api/super-admin/gyms/:id
 * Obtener detalle de un gimnasio
 */
router.get('/gyms/:id', validateMiddleware(getGymByIdSchema), superAdminController.getGymById);

/**
 * POST /api/super-admin/gyms
 * Crear nuevo gimnasio + admin
 */
router.post('/gyms', validateMiddleware(createGymSchema), superAdminController.createGym);

/**
 * PATCH /api/super-admin/gyms/:id
 * Actualizar gimnasio
 */
router.patch('/gyms/:id', validateMiddleware(updateGymSchema), superAdminController.updateGym);

/**
 * POST /api/super-admin/gyms/:id/toggle
 * Activar/Suspender gimnasio
 */
router.post('/gyms/:id/toggle', validateMiddleware(toggleGymSchema), superAdminController.toggleGym);

/**
 * GET /api/super-admin/invoices
 * Listar todas las facturas
 */
router.get('/invoices', superAdminController.getInvoices);

/**
 * POST /api/super-admin/invoices/generate
 * Generar facturas mensuales
 */
router.post('/invoices/generate', superAdminController.generateInvoices);

export default router;
