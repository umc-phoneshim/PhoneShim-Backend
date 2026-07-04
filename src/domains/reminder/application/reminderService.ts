import AppError from '../../../shared/errors/AppError';

import {
  applyReminderUpdate,
  createReminder,
  type CreateReminderPayload,
  type UpdateReminderPayload
} from '../domain/reminderEntity';
import * as reminderRepository from '../infrastructure/reminderRepository';

export async function registerReminder(payload: CreateReminderPayload) {
  const newReminder = createReminder(payload);

  return reminderRepository.save(newReminder);
}

export async function getReminders(userId: string) {
  if (!userId) {
    throw new AppError('userId는 필수입니다.', 400, 'INVALID_USER_ID');
  }

  return reminderRepository.findAllByUserId(userId);
}

export async function getReminderById(id: string) {
  const reminder = await reminderRepository.findById(id);

  if (!reminder) {
    throw new AppError('해당 리마인더를 찾을 수 없습니다.', 404, 'REMINDER_NOT_FOUND');
  }

  return reminder;
}

export async function updateReminder(id: string, payload: UpdateReminderPayload) {
  const current = await getReminderById(id);

  const validatedPayload = applyReminderUpdate(payload, current);

  return reminderRepository.update(id, validatedPayload);
}

export async function deleteReminder(id: string) {
  await getReminderById(id);

  await reminderRepository.deleteById(id);
}
