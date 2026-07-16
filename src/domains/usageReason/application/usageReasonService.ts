import { AppError, NotFoundError } from '../../../shared/errors/appError';

import * as monitoredAppRepository from '../../monitoredApp/infrastructure/monitoredAppRepository';
import { formatDateOnly } from '../../usageLog/domain/usageLogEntity';
import {
  createUsageReasonEntity,
  isWithinReasonWindow,
  type CreateUsageReasonPayload,
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
): Promise<UsageReasonRecord> {
  const monitoredApp = await monitoredAppRepository.findByIdAndUserId(
    payload.monitoredAppId,
    payload.userId
  );

  if (!monitoredApp) {
    throw new NotFoundError('Monitored app was not found', 'MONITORED_APP_NOT_FOUND');
  }

  const newUsageReason = createUsageReasonEntity(payload);

  if (!isWithinReasonWindow(newUsageReason.date, new Date())) {
    throw usageReasonTimeForbidden();
  }

  const saved = await usageReasonRepository.save(newUsageReason);

  return {
    id: saved.id,
    userId: saved.userId,
    monitoredAppId: saved.monitoredAppId,
    usageLogId: saved.usageLogId,
    date: formatDateOnly(saved.date),
    timeRangeStart: saved.timeRangeStart,
    timeRangeEnd: saved.timeRangeEnd,
    reason: saved.reason,
    createdAt: saved.createdAt,
    updatedAt: saved.updatedAt
  };
}
