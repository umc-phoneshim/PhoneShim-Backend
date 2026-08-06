import { NotFoundError } from '../../../shared/errors/appError';

import * as monitoredAppRepository from '../../monitoredApp/infrastructure/monitoredAppRepository';
import { formatDateOnly, getKstDateOnly } from '../../usageLog/domain/usageLogEntity';
import {
  createUsageSessionEntity,
  type CreateUsageSessionPayload,
  type UsageSessionRecord
} from '../domain/usageSessionEntity';
import * as usageSessionRepository from '../infrastructure/usageSessionRepository';

// REP101: 앱 사용 세션 하나를 저장
export async function createUsageSession(
  payload: CreateUsageSessionPayload
): Promise<UsageSessionRecord> {
  const monitoredApp = await monitoredAppRepository.findByIdAndUserId(
    payload.monitoredAppId,
    payload.userId
  );

  if (!monitoredApp) {
    throw new NotFoundError('Monitored app was not found', 'MONITORED_APP_NOT_FOUND');
  }

  const newUsageSession = createUsageSessionEntity(payload);
  const saved = await usageSessionRepository.save(newUsageSession);

  return {
    id: saved.id,
    userId: saved.userId,
    monitoredAppId: saved.monitoredAppId,
    date: formatDateOnly(saved.date),
    startTime: saved.startTime,
    endTime: saved.endTime,
    createdAt: saved.createdAt,
    updatedAt: saved.updatedAt
  };
}

// REP101: 특정 날짜의 세션 목록을 조회
// date가 없으면 KST 기준 오늘을 사용
export async function getUsageSessionsByDate(
  userId: string,
  date?: string
): Promise<UsageSessionRecord[]> {
  const targetDate = getKstDateOnly(date);
  const sessions = await usageSessionRepository.findAllByUserIdAndDate(userId, targetDate);

  return sessions.map((session) => ({
    id: session.id,
    userId: session.userId,
    monitoredAppId: session.monitoredAppId,
    date: formatDateOnly(session.date),
    startTime: session.startTime,
    endTime: session.endTime,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt
  }));
}
