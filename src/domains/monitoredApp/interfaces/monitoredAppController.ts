import { UnauthorizedError } from '../../../shared/errors/appError';
import { sendCreated, sendSuccess } from '../../../shared/responses/apiResponse';
import asyncHandler from '../../../shared/utils/asyncHandler';

import * as monitoredAppService from '../application/monitoredAppService';
import type { CreateMonitoredAppRequest, UpdateMonitoredAppRequest } from './monitoredAppDto';

const getAuthenticatedUserId = (user?: Express.Request['user']): string => {
  if (!user?.userId) {
    throw new UnauthorizedError('Authentication required');
  }

  return user.userId;
};

export const createMonitoredApp = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const result = await monitoredAppService.createMonitoredApp({
    ...(req.body as CreateMonitoredAppRequest),
    userId
  });

  sendCreated(res, result);
});

export const getMonitoredApps = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const result = await monitoredAppService.getMonitoredApps(userId);

  sendSuccess(res, result);
});

export const getMonitoredAppById = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const result = await monitoredAppService.getMonitoredAppById(req.params.id, userId);

  sendSuccess(res, result);
});

export const updateMonitoredApp = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);
  const result = await monitoredAppService.updateMonitoredApp(
    req.params.id,
    userId,
    req.body as UpdateMonitoredAppRequest
  );

  sendSuccess(res, result);
});

export const deleteMonitoredApp = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req.user);

  await monitoredAppService.deleteMonitoredApp(req.params.id, userId);

  res.status(204).send();
});
