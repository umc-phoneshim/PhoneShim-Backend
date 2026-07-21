import { Router } from 'express';

import { authenticate } from '../../../shared/middlewares/authMiddleware';
import { validateRequestBody } from '../../../shared/validation/requestValidator';

import * as alertSettingController from './alertSettingController';
import { updateAlertSettingRequestSchema } from './alertSettingDto';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /api/alert-settings:
 *   get:
 *     summary: Get the daily report alert setting (REP107)
 *     tags:
 *       - AlertSettings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Alert setting.
 */
router.get('/', alertSettingController.getAlertSetting);

/**
 * @openapi
 * /api/alert-settings:
 *   patch:
 *     summary: Update the daily report alert time (REP107)
 *     tags:
 *       - AlertSettings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Alert setting updated.
 */
router.patch(
  '/',
  validateRequestBody(updateAlertSettingRequestSchema),
  alertSettingController.updateAlertSetting
);

export default router;
