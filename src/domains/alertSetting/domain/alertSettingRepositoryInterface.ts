import type { AlertSetting } from './alertSettingEntity';

export default interface AlertSettingRepositoryInterface {
  findOrCreateByUserId(userId: string): Promise<AlertSetting>;
  updateAlertTimeMinutes(userId: string, alertTimeMinutes: number): Promise<AlertSetting>;
}
