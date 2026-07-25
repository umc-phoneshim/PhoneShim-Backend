import type { DailyDeviceUsage, NewDeviceUsage } from './deviceUsageEntity';

export default interface DeviceUsageRepositoryInterface {
  upsertDaily(deviceUsage: NewDeviceUsage): Promise<DailyDeviceUsage>;
}
