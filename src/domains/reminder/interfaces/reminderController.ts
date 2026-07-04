import asyncHandler from '../../../shared/utils/asyncHandler';
import AppError from '../../../shared/errors/AppError';

import * as reminderService from '../application/reminderService';
import type { CreateReminderRequestBody, UpdateReminderRequestBody } from './reminderDto';

export const createReminder = asyncHandler(async (req, res) => {
  const body = req.body as CreateReminderRequestBody;

  const reminder = await reminderService.registerReminder(body);

  res.status(201).json({
    success: true,
    data: reminder
  });
});

export const getReminders = asyncHandler(async (req, res) => {
  const userId = req.query.userId as string | undefined;

  if (!userId) {
    throw new AppError('userId 쿼리 파라미터는 필수입니다.', 400, 'INVALID_USER_ID');
  }

  const reminders = await reminderService.getReminders(userId);

  res.json({
    success: true,
    data: reminders
  });
});

export const getReminderById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const reminder = await reminderService.getReminderById(id);

  res.json({
    success: true,
    data: reminder
  });
});

export const updateReminder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const body = req.body as UpdateReminderRequestBody;

  const reminder = await reminderService.updateReminder(id, body);

  res.json({
    success: true,
    data: reminder
  });
});

export const deleteReminder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await reminderService.deleteReminder(id);

  res.status(204).send();
});
