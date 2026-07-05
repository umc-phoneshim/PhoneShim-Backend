import asyncHandler from '../../../shared/utils/asyncHandler';

import * as monitoredAppService from '../application/monitoredAppService';
import type {
  CreateMonitoredAppRequestBody,
  UpdateMonitoredAppRequestBody
} from './monitoredAppDto';

export const createMonitoredApp = asyncHandler(async (req, res) => {
  const body = req.body as CreateMonitoredAppRequestBody;

  const monitoredApp = await monitoredAppService.registerMonitoredApp({
    ...body,
    userId: req.userId!
  });

  res.status(201).json({
    success: true,
    data: monitoredApp
  });
});

export const getMonitoredApps = asyncHandler(async (req, res) => {
  const monitoredApps = await monitoredAppService.getMonitoredApps(req.userId!);

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
