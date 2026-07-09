import { Router } from 'express';

import { authenticate } from '../../../shared/middlewares/authMiddleware';
import { validateRequestBody } from '../../../shared/validation/requestValidator';
import { createAppGoalRequestSchema, updateAppGoalRequestSchema } from './appGoalDto';
import * as appGoalController from './appGoalController';

const router = Router({ mergeParams: true });

router.use(authenticate);

/**
 * @openapi
 * /api/monitored-apps/{monitoredAppId}/goal:
 *   get:
 *     summary: Get an app goal
 *     tags:
 *       - AppGoals
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: App goal detail.
 */
router.get('/', appGoalController.getAppGoal);

/**
 * @openapi
 * /api/monitored-apps/{monitoredAppId}/goal:
 *   post:
 *     summary: Create an app goal
 *     tags:
 *       - AppGoals
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: App goal created.
 */
router.post('/', validateRequestBody(createAppGoalRequestSchema), appGoalController.createAppGoal);

/**
 * @openapi
 * /api/monitored-apps/{monitoredAppId}/goal:
 *   patch:
 *     summary: Update an app goal
 *     tags:
 *       - AppGoals
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: App goal updated.
 */
router.patch(
  '/',
  validateRequestBody(updateAppGoalRequestSchema),
  appGoalController.updateAppGoal
);

/**
 * @openapi
 * /api/monitored-apps/{monitoredAppId}/goal:
 *   delete:
 *     summary: Delete an app goal
 *     tags:
 *       - AppGoals
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: App goal deleted.
 */
router.delete('/', appGoalController.deleteAppGoal);

export default router;
