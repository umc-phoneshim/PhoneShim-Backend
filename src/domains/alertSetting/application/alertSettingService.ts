import { validateAlertTimeMinutes } from '../domain/alertSettingEntity';
import * as alertSettingRepository from '../infrastructure/alertSettingRepository';

export async function getAlertSetting(userId: string) {
  return alertSettingRepository.findOrCreateByUserId(userId);
}

export async function updateAlertSetting(userId: string, alertTimeMinutes: number) {
  const validated = validateAlertTimeMinutes(alertTimeMinutes);

  return alertSettingRepository.updateAlertTimeMinutes(userId, validated);
}
