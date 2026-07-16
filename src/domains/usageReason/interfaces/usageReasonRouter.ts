import { Router } from 'express';

import { authenticate } from '../../../shared/middlewares/authMiddleware';
import { validateRequestBody } from '../../../shared/validation/requestValidator';

import * as usageReasonController from './usageReasonController';
import { createUsageReasonRequestSchema } from './usageReasonDto';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /api/usage-reasons:
 *   post:
 *     summary: Create a usage reason for an app usage time block
 *     tags:
 *       - UsageReasons
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Usage reason created.
 */
router.post(
  '/',
  validateRequestBody(createUsageReasonRequestSchema),
  usageReasonController.createUsageReason
);

export default router;
