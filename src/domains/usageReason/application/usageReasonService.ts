import { NotFoundError } from '../../../shared/errors/appError';

import * as monitoredAppRepository from '../../monitoredApp/infrastructure/monitoredAppRepository';
import { formatDateOnly, parseMonthRange } from '../../usageLog/domain/usageLogEntity';
import {
  buildUsageReasonCalendar,
  createUsageReasonEntities,
  type CreateUsageReasonPayload,
  type UsageReasonCalendarDay,
  type UsageReasonRecord
} from '../domain/usageReasonEntity';
import * as usageReasonRepository from '../infrastructure/usageReasonRepository';

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
