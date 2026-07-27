import { Router } from 'express';

import { authenticate } from '../../../shared/middlewares/authMiddleware';
import { validateRequestBody } from '../../../shared/validation/requestValidator';

import * as deviceUsageController from './deviceUsageController';
import { recordDeviceUsageRequestSchema } from './deviceUsageDto';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /api/device-usage:
 *   put:
 *     summary: Sync today's total device usage minutes for all apps
 *     tags:
 *       - DeviceUsage
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daily device usage upserted.
 */
router.put(
  '/',
  validateRequestBody(recordDeviceUsageRequestSchema),
  deviceUsageController.recordDeviceUsage
);

export default router;
