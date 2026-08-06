import { BadRequestError } from '../../../shared/errors/appError';

import { getKstDateOnly } from '../../usageLog/domain/usageLogEntity';

export type UsageSession = {
  id: string;
  userId: string;
  monitoredAppId: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateUsageSessionPayload = {
  userId: string;
  monitoredAppId: string;
  date: string;
  startTime: string;
  endTime: string;
};

export type NewUsageSession = {
  userId: string;
  monitoredAppId: string;
  date: Date;
  startTime: Date;
  endTime: Date;
};

// API_SPEC.md 응답 형태: date는 YYYY-MM-DD 문자열, startTime/endTime은 ISO string
export type UsageSessionRecord = {
  id: string;
  userId: string;
  monitoredAppId: string;
  date: string;
  startTime: Date;
  endTime: Date;
  createdAt: Date;
  updatedAt: Date;
};

function parseTime(value: string, fieldName: string): Date {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new BadRequestError(`${fieldName} must be a valid ISO date string`, 'VALIDATION_ERROR');
  }

  return parsed;
}

// 안드로이드가 앱 사용 구간 하나를 보내면 저장용 엔티티로 생성
export function createUsageSessionEntity(payload: CreateUsageSessionPayload): NewUsageSession {
  const startTime = parseTime(payload.startTime, 'startTime');
  const endTime = parseTime(payload.endTime, 'endTime');

  if (endTime.getTime() <= startTime.getTime()) {
    throw new BadRequestError('endTime must be after startTime', 'VALIDATION_ERROR');
  }

  return {
    userId: payload.userId,
    monitoredAppId: payload.monitoredAppId,
    date: getKstDateOnly(payload.date),
    startTime,
    endTime
  };
}
