import AppError from '../../../shared/errors/AppError';

import {
  applyMonitoredAppUpdate,
  createMonitoredApp,
  type CreateMonitoredAppPayload,
  type UpdateMonitoredAppPayload
} from '../domain/monitoredAppEntity';
import * as monitoredAppRepository from '../infrastructure/monitoredAppRepository';

export async function registerMonitoredApp(payload: CreateMonitoredAppPayload) {
  const newMonitoredApp = createMonitoredApp(payload);

  return monitoredAppRepository.save(newMonitoredApp);
}

export async function getMonitoredApps(userId: string) {
  if (!userId) {
    throw new AppError('userId는 필수입니다.', 400, 'INVALID_USER_ID');
  }

  return monitoredAppRepository.findAllByUserId(userId);
}

export async function getMonitoredAppById(id: string) {
  const monitoredApp = await monitoredAppRepository.findById(id);

  if (!monitoredApp) {
    throw new AppError('해당 감시 앱을 찾을 수 없습니다.', 404, 'MONITORED_APP_NOT_FOUND');
  }

  return monitoredApp;
}

export async function updateMonitoredApp(id: string, payload: UpdateMonitoredAppPayload) {
  await getMonitoredAppById(id);

  const validatedPayload = applyMonitoredAppUpdate(payload);

  return monitoredAppRepository.update(id, validatedPayload);
}

export async function deleteMonitoredApp(id: string) {
  await getMonitoredAppById(id);

  await monitoredAppRepository.deleteById(id);
}
