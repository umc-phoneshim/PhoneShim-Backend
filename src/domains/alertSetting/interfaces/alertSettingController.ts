import asyncHandler from '../../../shared/utils/asyncHandler';
import AppError from '../../../shared/errors/AppError';

import * as alertSettingService from '../application/alertSettingService';
import type {
  CreateAlertSettingRequestBody,
  UpdateAlertSettingRequestBody
} from './alertSettingDto';

export const createAlertSetting = asyncHandler(async (req, res) => {
  const body = req.body as CreateAlertSettingRequestBody;

  const alertSetting = await alertSettingService.registerAlertSetting(body);

  res.status(201).json({
    success: true,
    data: alertSetting
  });
});

export const getAlertSetting = asyncHandler(async (req, res) => {
  const userId = req.query.userId as string | undefined;

  if (!userId) {
    throw new AppError('userId 쿼리 파라미터는 필수입니다.', 400, 'INVALID_USER_ID');
  }

  const alertSetting = await alertSettingService.getAlertSettingByUserId(userId);

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
