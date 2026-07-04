import { Router } from 'express';

import * as reminderController from './reminderController';

const router = Router();

router.post('/', reminderController.createReminder);
router.get('/', reminderController.getReminders);
router.get('/:id', reminderController.getReminderById);
router.patch('/:id', reminderController.updateReminder);
router.delete('/:id', reminderController.deleteReminder);

export default router;
