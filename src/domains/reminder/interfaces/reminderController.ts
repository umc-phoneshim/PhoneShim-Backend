import asyncHandler from '../../../shared/utils/asyncHandler';

import * as reminderService from '../application/reminderService';
import type { CreateReminderRequestBody, UpdateReminderRequestBody } from './reminderDto';

export const createReminder = asyncHandler(async (req, res) => {
  const body = req.body as CreateReminderRequestBody;

  const reminder = await reminderService.registerReminder({ ...body, userId: req.userId! });

  res.status(201).json({
    success: true,
    data: reminder
  });
});

export const getReminders = asyncHandler(async (req, res) => {
  const reminders = await reminderService.getReminders(req.userId!);

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
