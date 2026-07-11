import { Router } from 'express';

import { authenticate } from '../../../shared/middlewares/authMiddleware';
import { validateRequestBody } from '../../../shared/validation/requestValidator';

import * as usageLogController from './usageLogController';
import { upsertUsageLogRequestSchema } from './usageLogDto';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /api/usage-logs:
 *   put:
 *     summary: Create or update a daily app usage log (used by MAIN dashboard)
 *     tags:
 *       - UsageLogs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usage log saved.
 */
router.put(
  '/',
  validateRequestBody(upsertUsageLogRequestSchema),
  usageLogController.upsertUsageLog
);

export default router;
