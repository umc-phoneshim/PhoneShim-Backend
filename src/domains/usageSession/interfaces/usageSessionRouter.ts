import { Router } from 'express';

import { authenticate } from '../../../shared/middlewares/authMiddleware';
import { validateRequestBody } from '../../../shared/validation/requestValidator';
import { createUsageSessionRequestSchema } from './usageSessionDto';
import * as usageSessionController from './usageSessionController';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /api/usage-sessions:
 *   get:
 *     summary: Get app usage sessions for a date (REP101 timetable)
 *     tags:
 *       - UsageSessions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usage sessions for the given date (KST today if omitted).
 */
router.get('/', usageSessionController.getUsageSessionsByDate);

/**
 * @openapi
 * /api/usage-sessions:
 *   post:
 *     summary: Save one app usage session (REP101 timetable)
 *     tags:
 *       - UsageSessions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Usage session saved.
 */
router.post(
  '/',
  validateRequestBody(createUsageSessionRequestSchema),
  usageSessionController.createUsageSession
);

export default router;
