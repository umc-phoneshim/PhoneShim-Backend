import asyncHandler from '../../../shared/utils/asyncHandler';

import * as alertSettingService from '../application/alertSettingService';
import type {
  CreateAlertSettingRequestBody,
  UpdateAlertSettingRequestBody
} from './alertSettingDto';

export const createAlertSetting = asyncHandler(async (req, res) => {
  const body = req.body as CreateAlertSettingRequestBody;

  const alertSetting = await alertSettingService.registerAlertSetting({
    ...body,
    userId: req.userId!
  });

  res.status(201).json({
    success: true,
    data: alertSetting
  });
});

export const getAlertSetting = asyncHandler(async (req, res) => {
  const alertSetting = await alertSettingService.getAlertSettingByUserId(req.userId!);

  res.json({
    success: true,
    data: alertSetting
  });
});

export const getAlertSettingById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const alertSetting = await alertSettingService.getAlertSettingById(id);

  res.json({
    success: true,
    data: alertSetting
  });
});

export const updateAlertSetting = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const body = req.body as UpdateAlertSettingRequestBody;

  const alertSetting = await alertSettingService.updateAlertSetting(id, body);

  res.json({
    success: true,
    data: alertSetting
  });
});

export const deleteAlertSetting = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await alertSettingService.deleteAlertSetting(id);

  res.status(204).send();
});
