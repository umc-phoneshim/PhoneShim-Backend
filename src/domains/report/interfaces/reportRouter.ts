import { Router } from 'express';

import { authenticate } from '../../../shared/middlewares/authMiddleware';
import * as reportController from './reportController';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /api/reports/summary:
 *   get:
 *     summary: Get usage-reason summary for a period (REP104)
 *     tags:
 *       - Report
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Per-reason usage time (broken down by app) for the given range.
 */
router.get('/summary', reportController.getReportSummary);

/**
 * @openapi
 * /api/reports/suggestion:
 *   get:
 *     summary: Get a coaching suggestion based on today's goal achievement (REP103)
 *     tags:
 *       - Report
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A suggestion (type, message, excess minutes, app name) for the given date.
 */
router.get('/suggestion', reportController.getReportSuggestion);

export default router;
