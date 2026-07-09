import { Router } from 'express';

import { authenticate } from '../../../shared/middlewares/authMiddleware';

import * as dashboardController from './dashboardController';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /api/dashboard/daily-summary:
 *   get:
 *     summary: Get today's phone usage compared to the total goal (MAIN103)
 *     tags:
 *       - Dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Today's usage summary versus the total daily goal.
 */
router.get('/daily-summary', dashboardController.getDailyUsageSummary);

export default router;
