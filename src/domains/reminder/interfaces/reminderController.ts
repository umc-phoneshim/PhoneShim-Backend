import { UnauthorizedError } from '../../../shared/errors/appError';
import { sendCreated, sendSuccess } from '../../../shared/responses/apiResponse';
import asyncHandler from '../../../shared/utils/asyncHandler';
import * as reminderService from '../application/reminderService';
import type { CreateReminderRequest, UpdateReminderRequest } from './reminderDto';

const getAuthenticatedUserId = (user?: Express.Request['user']): string => {
  if (!user?.userId) {
    throw new UnauthorizedError('Authentication required');
  }

  return user.userId;
};

export const createReminder = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const result = await reminderService.createReminder({
    ...(req.body as CreateReminderRequest),
    userId
  });

  sendCreated(res, result);
});

export const getReminders = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const date = typeof req.query.date === 'string' ? req.query.date : undefined;
  const result = await reminderService.getReminders(userId, date);

  sendSuccess(res, result);
});

export const getReminderById = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const result = await reminderService.getReminderById(req.params.id, userId);

  sendSuccess(res, result);
});

export const updateReminder = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const result = await reminderService.updateReminder(
    req.params.id,
    userId,
    req.body as UpdateReminderRequest
  );

  sendSuccess(res, result);
});

export const deleteReminder = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);

  await reminderService.deleteReminder(req.params.id, userId);

  res.status(204).send();
});
