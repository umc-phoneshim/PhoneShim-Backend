import type {
  AlertSetting,
  NewAlertSetting,
  UpdateAlertSettingPayload
} from './alertSettingEntity';

export default interface AlertSettingRepositoryInterface {
  save(alertSetting: NewAlertSetting): Promise<AlertSetting>;
  findByUserId(userId: string): Promise<AlertSetting | null>;
  findById(id: string): Promise<AlertSetting | null>;
  update(id: string, payload: UpdateAlertSettingPayload): Promise<AlertSetting>;
  deleteById(id: string): Promise<void>;
}
