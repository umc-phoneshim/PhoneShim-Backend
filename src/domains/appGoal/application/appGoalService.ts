import { AppError, NotFoundError } from '../../../shared/errors/appError';

import * as monitoredAppRepository from '../../monitoredApp/infrastructure/monitoredAppRepository';
import {
  createAppGoalEntity,
  createAppGoalUpdate,
  type CreateAppGoalPayload,
  type UpdateAppGoalPayload
} from '../domain/appGoalEntity';
import * as appGoalRepository from '../infrastructure/appGoalRepository';

const appGoalAlreadyExists = () =>
  new AppError(409, 'APP_GOAL_ALREADY_EXISTS', 'App goal already exists for this monitored app');

const appGoalNotFound = () => new NotFoundError('App goal was not found', 'APP_GOAL_NOT_FOUND');

async function ensureMonitoredAppOwnership(monitoredAppId: string, userId: string) {
  const monitoredApp = await monitoredAppRepository.findByIdAndUserId(monitoredAppId, userId);

  if (!monitoredApp) {
    throw new NotFoundError('Monitored app was not found', 'MONITORED_APP_NOT_FOUND');
  }

  return monitoredApp;
}

export async function createAppGoal(
  userId: string,
  monitoredAppId: string,
  payload: Omit<CreateAppGoalPayload, 'monitoredAppId'>
) {
  await ensureMonitoredAppOwnership(monitoredAppId, userId);

  const existing = await appGoalRepository.findByMonitoredAppId(monitoredAppId);

  if (existing) {
    throw appGoalAlreadyExists();
  }

  const appGoal = createAppGoalEntity({ ...payload, monitoredAppId });

  try {
    return await appGoalRepository.save(appGoal);
  } catch (error) {
    if (appGoalRepository.isPrismaKnownError(error, appGoalRepository.UNIQUE_CONSTRAINT_ERROR)) {
      throw appGoalAlreadyExists();
    }

    throw error;
  }
}

export async function getAppGoal(userId: string, monitoredAppId: string) {
  await ensureMonitoredAppOwnership(monitoredAppId, userId);

  const appGoal = await appGoalRepository.findByMonitoredAppId(monitoredAppId);

  if (!appGoal) {
    throw appGoalNotFound();
  }

  return appGoal;
}

export async function updateAppGoal(
  userId: string,
  monitoredAppId: string,
  payload: UpdateAppGoalPayload
) {
  await getAppGoal(userId, monitoredAppId);

  const update = createAppGoalUpdate(payload);

  try {
    return await appGoalRepository.update(monitoredAppId, update);
  } catch (error) {
    if (appGoalRepository.isPrismaKnownError(error, appGoalRepository.RECORD_NOT_FOUND_ERROR)) {
      throw appGoalNotFound();
    }

    throw error;
  }
}

export async function deleteAppGoal(userId: string, monitoredAppId: string) {
  await getAppGoal(userId, monitoredAppId);

  try {
    await appGoalRepository.deleteByMonitoredAppId(monitoredAppId);
  } catch (error) {
    if (appGoalRepository.isPrismaKnownError(error, appGoalRepository.RECORD_NOT_FOUND_ERROR)) {
      throw appGoalNotFound();
    }

    throw error;
  }
}
