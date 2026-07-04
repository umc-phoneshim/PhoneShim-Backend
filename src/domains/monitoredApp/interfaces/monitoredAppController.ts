import asyncHandler from '../../../shared/utils/asyncHandler';
import AppError from '../../../shared/errors/AppError';

import * as monitoredAppService from '../application/monitoredAppService';
import type { CreateMonitoredAppRequestBody, UpdateMonitoredAppRequestBody } from './monitoredAppDto';

export const createMonitoredApp = asyncHandler(async (req, res) => {
  const body = req.body as CreateMonitoredAppRequestBody;

  const monitoredApp = await monitoredAppService.registerMonitoredApp(body);

  res.status(201).json({
    success: true,
    data: monitoredApp
  });
});

export const getMonitoredApps = asyncHandler(async (req, res) => {
  const userId = req.query.userId as string | undefined;

  if (!userId) {
    throw new AppError('userId 쿼리 파라미터는 필수입니다.', 400, 'INVALID_USER_ID');
  }

  const monitoredApps = await monitoredAppService.getMonitoredApps(userId);

  res.json({
    success: true,
    data: monitoredApps
  });
});

export const getMonitoredAppById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const monitoredApp = await monitoredAppService.getMonitoredAppById(id);

  res.json({
    success: true,
    data: monitoredApp
  });
});

export const updateMonitoredApp = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const body = req.body as UpdateMonitoredAppRequestBody;

  const monitoredApp = await monitoredAppService.updateMonitoredApp(id, body);

  res.json({
    success: true,
    data: monitoredApp
  });
});

export const deleteMonitoredApp = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await monitoredAppService.deleteMonitoredApp(id);

  res.status(204).send();
});
