import { Router } from 'express';

import { authenticate } from '../../../shared/middlewares/authMiddleware';
import { validateRequestBody } from '../../../shared/validation/requestValidator';
import {
  createReminderRequestSchema,
  updateReminderRequestSchema
} from './reminderDto';
import * as reminderController from './reminderController';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /api/reminders:
 *   get:
 *     summary: List reminders by date
 *     tags:
 *       - Reminders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           example: "2026-07-16"
 *         required: false
 *         description: YYYY-MM-DD date. Defaults to today in KST.
 *     responses:
 *       200:
 *         description: Reminder list.
 */
router.get('/', reminderController.getReminders);

/**
 * @openapi
 * /api/reminders:
 *   post:
 *     summary: Create a reminder
 *     tags:
 *       - Reminders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Reminder created.
 */
router.post(
  '/',
  validateRequestBody(createReminderRequestSchema),
  reminderController.createReminder
);

/**
 * @openapi
 * /api/reminders/{id}:
 *   get:
 *     summary: Get a reminder
 *     tags:
 *       - Reminders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reminder detail.
 */
router.get('/:id', reminderController.getReminderById);

/**
 * @openapi
 * /api/reminders/{id}:
 *   patch:
 *     summary: Update a reminder
 *     tags:
 *       - Reminders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reminder updated.
 */
router.patch(
  '/:id',
  validateRequestBody(updateReminderRequestSchema),
  reminderController.updateReminder
);

/**
 * @openapi
 * /api/reminders/{id}:
 *   delete:
 *     summary: Delete a reminder
 *     tags:
 *       - Reminders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Reminder deleted.
 */
router.delete('/:id', reminderController.deleteReminder);

export default router;
