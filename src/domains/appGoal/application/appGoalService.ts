import AppError from '../../../shared/errors/AppError';

import {
  applyAppGoalUpdate,
  createAppGoal,
  type CreateAppGoalPayload,
  type UpdateAppGoalPayload
} from '../domain/appGoalEntity';
import * as appGoalRepository from '../infrastructure/appGoalRepository';

export async function registerAppGoal(payload: CreateAppGoalPayload) {
  const existing = await appGoalRepository.findByMonitoredAppId(payload.monitoredAppId);

  if (existing) {
    throw new AppError('이미 해당 앱의 목표가 설정되어 있습니다.', 409, 'APP_GOAL_ALREADY_EXISTS');
  }

  const newAppGoal = createAppGoal(payload);

  return appGoalRepository.save(newAppGoal);
}

export async function getAppGoalByMonitoredAppId(monitoredAppId: string) {
  if (!monitoredAppId) {
    throw new AppError('monitoredAppId는 필수입니다.', 400, 'INVALID_MONITORED_APP_ID');
  }

  const appGoal = await appGoalRepository.findByMonitoredAppId(monitoredAppId);

  if (!appGoal) {
    throw new AppError('해당 앱의 목표를 찾을 수 없습니다.', 404, 'APP_GOAL_NOT_FOUND');
  }

  return appGoal;
}

export async function getAppGoalById(id: string) {
  const appGoal = await appGoalRepository.findById(id);

  if (!appGoal) {
    throw new AppError('해당 앱 목표를 찾을 수 없습니다.', 404, 'APP_GOAL_NOT_FOUND');
  }

  return appGoal;
}

export async function updateAppGoal(id: string, payload: UpdateAppGoalPayload) {
  await getAppGoalById(id);

  const validatedPayload = applyAppGoalUpdate(payload);

  return appGoalRepository.update(id, validatedPayload);
}

export async function deleteAppGoal(id: string) {
  await getAppGoalById(id);

  await appGoalRepository.deleteById(id);
}
