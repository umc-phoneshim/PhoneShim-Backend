import { Router } from 'express';

import { authenticate } from '../../../shared/middlewares/authMiddleware';
import { validateRequestBody } from '../../../shared/validation/requestValidator';
import { createAppGoalRequestSchema, updateAppGoalRequestSchema } from './appGoalDto';
import * as appGoalController from './appGoalController';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /api/app-goals?monitoredAppId=:
 *   get:
 *     summary: Get an app goal for a monitored app
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
 * /api/app-goals:
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
 * /api/app-goals/{id}:
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
  '/:id',
  validateRequestBody(updateAppGoalRequestSchema),
  appGoalController.updateAppGoal
);

/**
 * @openapi
 * /api/app-goals/{id}:
 *   delete:
 *     summary: Delete an app goal (extension beyond current API_SPEC.md — see docs update in this PR)
 *     tags:
 *       - AppGoals
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: App goal deleted.
 */
router.delete('/:id', appGoalController.deleteAppGoal);

export default router;
