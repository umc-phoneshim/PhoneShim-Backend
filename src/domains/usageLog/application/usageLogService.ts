import { NotFoundError } from '../../../shared/errors/appError';

import * as monitoredAppRepository from '../../monitoredApp/infrastructure/monitoredAppRepository';
import { createUsageLogEntity, type UpsertUsageLogPayload } from '../domain/usageLogEntity';
import * as usageLogRepository from '../infrastructure/usageLogRepository';

export async function upsertUsageLog(payload: UpsertUsageLogPayload) {
  const monitoredApp = await monitoredAppRepository.findByIdAndUserId(
    payload.monitoredAppId,
    payload.userId
  );

  if (!monitoredApp) {
    throw new NotFoundError('Monitored app was not found', 'MONITORED_APP_NOT_FOUND');
  }

  const usageLog = createUsageLogEntity(payload);

  return usageLogRepository.upsert(usageLog);
}
