import { Router } from 'express';

import { authenticate } from '../../../shared/middlewares/authMiddleware';
import { validateRequestBody } from '../../../shared/validation/requestValidator';
import appGoalRouter from '../../appGoal/interfaces/appGoalRouter';
import {
  createMonitoredAppRequestSchema,
  updateMonitoredAppRequestSchema
} from './monitoredAppDto';
import * as monitoredAppController from './monitoredAppController';

const router = Router();

router.use(authenticate);

router.use('/:monitoredAppId/goal', appGoalRouter);

/**
 * @openapi
 * /api/monitored-apps:
 *   get:
 *     summary: List monitored apps
 *     tags:
 *       - MonitoredApps
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Monitored app list.
 */
router.get('/', monitoredAppController.getMonitoredApps);

/**
 * @openapi
 * /api/monitored-apps:
 *   post:
 *     summary: Create a monitored app
 *     tags:
 *       - MonitoredApps
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Monitored app created.
 */
router.post(
  '/',
  validateRequestBody(createMonitoredAppRequestSchema),
  monitoredAppController.createMonitoredApp
);

/**
 * @openapi
 * /api/monitored-apps/{id}:
 *   get:
 *     summary: Get a monitored app
 *     tags:
 *       - MonitoredApps
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Monitored app detail.
 */
router.get('/:id', monitoredAppController.getMonitoredAppById);

/**
 * @openapi
 * /api/monitored-apps/{id}:
 *   patch:
 *     summary: Update a monitored app
 *     tags:
 *       - MonitoredApps
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Monitored app updated.
 */
router.patch(
  '/:id',
  validateRequestBody(updateMonitoredAppRequestSchema),
  monitoredAppController.updateMonitoredApp
);

/**
 * @openapi
 * /api/monitored-apps/{id}:
 *   delete:
 *     summary: Delete a monitored app
 *     tags:
 *       - MonitoredApps
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Monitored app deleted.
 */
router.delete('/:id', monitoredAppController.deleteMonitoredApp);

export default router;
