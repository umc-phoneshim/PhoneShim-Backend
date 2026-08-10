import { Router } from 'express';

import { authenticate } from '../../../shared/middlewares/authMiddleware';
import { validateRequestBody } from '../../../shared/validation/requestValidator';
import { recordUsageLogRequestSchema } from './usageLogDto';
import * as usageLogController from './usageLogController';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /api/usage-logs:
 *   get:
 *     summary: Get raw daily usage logs for a date (API_SPEC.md)
 *     tags:
 *       - UsageLogs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usage logs for the given date (KST today if omitted).
 */
router.get('/', usageLogController.getUsageLogsByDate);

/**
 * @openapi
 * /api/usage-logs/status:
 *   get:
 *     summary: Get today's monitored app usage status (MAIN104)
 *     tags:
 *       - UsageLogs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Today's usage status per monitored app.
 */
router.get('/status', usageLogController.getTodayUsageStatus);

/**
 * @openapi
 * /api/usage-logs/calendar:
 *   get:
 *     summary: Get days that met the usage goal in a month (REP106)
 *     tags:
 *       - UsageLogs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dates marked 'O' for the given month.
 */
router.get('/calendar', usageLogController.getUsageCalendar);

/**
 * @openapi
 * /api/usage-logs:
 *   put:
 *     summary: Sync today's cumulative usage minutes/entry count for a monitored app
 *     tags:
 *       - UsageLogs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usage log upserted.
 */
router.put(
  '/',
  validateRequestBody(recordUsageLogRequestSchema),
  usageLogController.recordUsageLog
);

export default router;
