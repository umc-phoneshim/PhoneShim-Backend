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

router.get('/', reminderController.getReminders);
router.post(
  '/',
  validateRequestBody(createReminderRequestSchema),
  reminderController.createReminder
);
router.get('/:id', reminderController.getReminderById);
router.patch(
  '/:id',
  validateRequestBody(updateReminderRequestSchema),
  reminderController.updateReminder
);
router.delete('/:id', reminderController.deleteReminder);

export default router;
