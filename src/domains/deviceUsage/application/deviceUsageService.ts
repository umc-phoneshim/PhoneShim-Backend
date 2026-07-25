import {
  createDeviceUsageEntity,
  type RecordDeviceUsagePayload
} from '../domain/deviceUsageEntity';
import * as deviceUsageRepository from '../infrastructure/deviceUsageRepository';

// 안드로이드가 그 날 기기 전체 사용시간을 보내면 그대로 저장
export async function recordDeviceUsage(payload: RecordDeviceUsagePayload) {
  const newDeviceUsage = createDeviceUsageEntity(payload);

  return deviceUsageRepository.upsertDaily(newDeviceUsage);
}
