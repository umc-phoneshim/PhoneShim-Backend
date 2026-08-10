import { Router } from 'express';

import { authenticate } from '../../../shared/middlewares/authMiddleware';
import { validateRequestBody } from '../../../shared/validation/requestValidator';
import { createTotalGoalRequestSchema, updateTotalGoalRequestSchema } from './totalGoalDto';
import * as totalGoalController from './totalGoalController';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /api/total-goals:
 *   get:
 *     summary: Get the authenticated user's total goal
 *     tags:
 *       - TotalGoals
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Total goal detail.
 */
router.get('/', totalGoalController.getTotalGoal);

/**
 * @openapi
 * /api/total-goals:
 *   post:
 *     summary: Create the authenticated user's total goal
 *     tags:
 *       - TotalGoals
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Total goal created.
 */
router.post(
  '/',
  validateRequestBody(createTotalGoalRequestSchema),
  totalGoalController.createTotalGoal
);

/**
 * @openapi
 * /api/total-goals:
 *   patch:
 *     summary: Update the authenticated user's total goal
 *     tags:
 *       - TotalGoals
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Total goal updated.
 */
router.patch(
  '/',
  validateRequestBody(updateTotalGoalRequestSchema),
  totalGoalController.updateTotalGoal
);

export default router;
