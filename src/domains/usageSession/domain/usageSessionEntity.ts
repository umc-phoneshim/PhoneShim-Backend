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
// date는 클라이언트 입력을 믿지 않고 startTime의 KST 날짜로 서버에서 파생
// (자정을 넘는 세션은 "시작한 날"에 귀속)
export function createUsageSessionEntity(payload: CreateUsageSessionPayload): NewUsageSession {
  const startTime = parseTime(payload.startTime, 'startTime');
  const endTime = parseTime(payload.endTime, 'endTime');

  if (endTime.getTime() <= startTime.getTime()) {
    throw new BadRequestError('endTime must be after startTime', 'VALIDATION_ERROR');
  }

  return {
    userId: payload.userId,
    monitoredAppId: payload.monitoredAppId,
    date: getKstDateOnly(startTime),
    startTime,
    endTime
  };
}

// 새 세션이 기존 세션들과 시간이 겹치는지 확인 (새 시작 < 기존 끝 AND 새 끝 > 기존 시작)
export function hasOverlappingSession(
  startTime: Date,
  endTime: Date,
  existingSessions: { startTime: Date; endTime: Date }[]
): boolean {
  return existingSessions.some(
    (session) =>
      startTime.getTime() < session.endTime.getTime() &&
      endTime.getTime() > session.startTime.getTime()
  );
}
