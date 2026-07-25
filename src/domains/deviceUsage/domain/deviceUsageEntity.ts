import { BadRequestError } from '../../../shared/errors/appError';

import { getKstDateOnly } from '../../usageLog/domain/usageLogEntity';

export type DailyDeviceUsage = {
  id: string;
  userId: string;
  date: Date;
  totalUsedMinutes: number;
  createdAt: Date;
  updatedAt: Date;
};

// 안드로이드가 그 날 "기기 전체(모든 앱) 사용시간"을 통째로 보내면
// (userId, date) 기준으로 저장 주의앱만 담는 usage_logs와 달리 폰 전체 사용량을 저장하는 용도

export type RecordDeviceUsagePayload = {
  userId: string;
  date?: string;
  totalUsedMinutes: number;
};

export type NewDeviceUsage = {
  userId: string;
  date: Date;
  totalUsedMinutes: number;
};

export function createDeviceUsageEntity(payload: RecordDeviceUsagePayload): NewDeviceUsage {
  if (!payload.userId.trim()) {
    throw new BadRequestError('userId is required', 'VALIDATION_ERROR');
  }

  if (!Number.isInteger(payload.totalUsedMinutes) || payload.totalUsedMinutes < 0) {
    throw new BadRequestError(
      'totalUsedMinutes must be a non-negative integer',
      'VALIDATION_ERROR'
    );
  }

  return {
    userId: payload.userId,
    date: getKstDateOnly(payload.date),
    totalUsedMinutes: payload.totalUsedMinutes
  };
}
