import AppError from '../../../shared/errors/AppError';

import {
  applyAlertSettingUpdate,
  createAlertSetting,
  type CreateAlertSettingPayload,
  type UpdateAlertSettingPayload
} from '../domain/alertSettingEntity';
import * as alertSettingRepository from '../infrastructure/alertSettingRepository';

export async function registerAlertSetting(payload: CreateAlertSettingPayload) {
  const existing = await alertSettingRepository.findByUserId(payload.userId);

  if (existing) {
    throw new AppError('이미 알림 설정이 존재합니다.', 409, 'ALERT_SETTING_ALREADY_EXISTS');
  }

  const newAlertSetting = createAlertSetting(payload);

  return alertSettingRepository.save(newAlertSetting);
}

export async function getAlertSettingByUserId(userId: string) {
  if (!userId) {
    throw new AppError('userId는 필수입니다.', 400, 'INVALID_USER_ID');
  }

  const alertSetting = await alertSettingRepository.findByUserId(userId);

  if (!alertSetting) {
    throw new AppError('해당 유저의 알림 설정을 찾을 수 없습니다.', 404, 'ALERT_SETTING_NOT_FOUND');
  }

  return alertSetting;
}

export async function getAlertSettingById(id: string) {
  const alertSetting = await alertSettingRepository.findById(id);

  if (!alertSetting) {
    throw new AppError('해당 알림 설정을 찾을 수 없습니다.', 404, 'ALERT_SETTING_NOT_FOUND');
  }

  return alertSetting;
}

export async function updateAlertSetting(id: string, payload: UpdateAlertSettingPayload) {
  await getAlertSettingById(id);

  const validatedPayload = applyAlertSettingUpdate(payload);

  return alertSettingRepository.update(id, validatedPayload);
}

export async function deleteAlertSetting(id: string) {
  await getAlertSettingById(id);

  await alertSettingRepository.deleteById(id);
}
