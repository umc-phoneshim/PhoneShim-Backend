import { AppError, NotFoundError } from '../../../shared/errors/appError';

import * as monitoredAppRepository from '../../monitoredApp/infrastructure/monitoredAppRepository';
import { formatDateOnly, parseMonthRange } from '../../usageLog/domain/usageLogEntity';
import {
  buildUsageReasonCalendar,
  createUsageReasonEntities,
  isWithinReasonWindow,
  type CreateUsageReasonPayload,
  type UsageReasonCalendarDay,
  type UsageReasonRecord
} from '../domain/usageReasonEntity';
import * as usageReasonRepository from '../infrastructure/usageReasonRepository';

const usageReasonTimeForbidden = () =>
  new AppError(
    403,
    'USAGE_REASON_TIME_FORBIDDEN',
    'Usage reason can only be written between 22:00 and 10:00'
  );

export async function createUsageReason(
  payload: CreateUsageReasonPayload
): Promise<UsageReasonRecord[]> {
  const monitoredApp = await monitoredAppRepository.findByIdAndUserId(
    payload.monitoredAppId,
    payload.userId
  );

  if (!monitoredApp) {
    throw new NotFoundError('Monitored app was not found', 'MONITORED_APP_NOT_FOUND');
  }

  const newUsageReasons = createUsageReasonEntities(payload);

  // 같은 시간 블록의 사유들은 날짜가 모두 같으므로 첫 번째 기준으로 입력 가능 시간대를 검사합니다.
  if (!isWithinReasonWindow(newUsageReasons[0].date, new Date())) {
    throw usageReasonTimeForbidden();
  }

  const saved = await usageReasonRepository.saveMany(newUsageReasons);

  return saved.map((row) => ({
    id: row.id,
    userId: row.userId,
    monitoredAppId: row.monitoredAppId,
    usageLogId: row.usageLogId,
    date: formatDateOnly(row.date),
    timeRangeStart: row.timeRangeStart,
    timeRangeEnd: row.timeRangeEnd,
    reason: row.reason,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  }));
}

export async function getUsageReasonCalendar(
  userId: string,
  month: string
): Promise<UsageReasonCalendarDay[]> {
  const { start, end } = parseMonthRange(month);
  const usageReasons = await usageReasonRepository.findAllByUserIdInRange(userId, start, end);

  return buildUsageReasonCalendar(start, end, usageReasons);
}
