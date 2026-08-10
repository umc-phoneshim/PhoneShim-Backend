import { AppError, BadRequestError, NotFoundError } from '../../../shared/errors/appError';

import * as monitoredAppRepository from '../../monitoredApp/infrastructure/monitoredAppRepository';
import {
  createAppGoalEntity,
  createAppGoalUpdate,
  type AppGoal,
  type CreateAppGoalPayload,
  type UpdateAppGoalPayload
} from '../domain/appGoalEntity';
import * as appGoalRepository from '../infrastructure/appGoalRepository';

const appGoalAlreadyExists = () =>
  new AppError(409, 'APP_GOAL_ALREADY_EXISTS', 'App goal already exists for this monitored app');

const appGoalNotFound = () => new NotFoundError('App goal was not found', 'APP_GOAL_NOT_FOUND');

const monitoredAppNotFound = () =>
  new NotFoundError('Monitored app was not found', 'MONITORED_APP_NOT_FOUND');

async function ensureMonitoredAppOwnership(monitoredAppId: string, userId: string) {
  const monitoredApp = await monitoredAppRepository.findByIdAndUserId(monitoredAppId, userId);

  if (!monitoredApp) {
    throw monitoredAppNotFound();
  }

  return monitoredApp;
}

// AppGoal에는 userId 컬럼이 없어서(1:1로 monitoredApp에 종속), 자기 소유가 맞는지는
// 항상 monitoredApp을 거쳐서 확인합니다. 본인 소유가 아니거나 없는 리소스는
// API_SPEC.md 공통 규칙대로 전부 404로 응답합니다.
async function getOwnedAppGoalById(id: string, userId: string): Promise<AppGoal> {
  const appGoal = await appGoalRepository.findById(id);

  if (!appGoal) {
    throw appGoalNotFound();
  }

  const monitoredApp = await monitoredAppRepository.findByIdAndUserId(
    appGoal.monitoredAppId,
    userId
  );

  if (!monitoredApp) {
    throw appGoalNotFound();
  }

  return appGoal;
}

export async function createAppGoal(userId: string, payload: CreateAppGoalPayload) {
  if (!payload.monitoredAppId.trim()) {
    throw new BadRequestError('monitoredAppId is required', 'VALIDATION_ERROR');
  }

  await ensureMonitoredAppOwnership(payload.monitoredAppId, userId);

  const existing = await appGoalRepository.findByMonitoredAppId(payload.monitoredAppId);

  if (existing) {
    throw appGoalAlreadyExists();
  }

  const appGoal = createAppGoalEntity(payload);

  try {
    return await appGoalRepository.save(appGoal);
  } catch (error) {
    if (appGoalRepository.isPrismaKnownError(error, appGoalRepository.UNIQUE_CONSTRAINT_ERROR)) {
      throw appGoalAlreadyExists();
    }

    throw error;
  }
}

// GET /api/app-goals?monitoredAppId=
export async function getAppGoalByMonitoredAppId(userId: string, monitoredAppId: string) {
  if (!monitoredAppId.trim()) {
    throw new BadRequestError('monitoredAppId is required', 'VALIDATION_ERROR');
  }

  await ensureMonitoredAppOwnership(monitoredAppId, userId);

  const appGoal = await appGoalRepository.findByMonitoredAppId(monitoredAppId);

  if (!appGoal) {
    throw appGoalNotFound();
  }

  return appGoal;
}

// PATCH /api/app-goals/:id
export async function updateAppGoal(id: string, userId: string, payload: UpdateAppGoalPayload) {
  await getOwnedAppGoalById(id, userId);

  const update = createAppGoalUpdate(payload);

  try {
    return await appGoalRepository.updateById(id, update);
  } catch (error) {
    if (appGoalRepository.isPrismaKnownError(error, appGoalRepository.RECORD_NOT_FOUND_ERROR)) {
      throw appGoalNotFound();
    }

    throw error;
  }
}

// DELETE /api/app-goals/:id — API_SPEC.md엔 아직 없는 확장 기능입니다 (docs 업데이트 필요).
export async function deleteAppGoal(id: string, userId: string) {
  await getOwnedAppGoalById(id, userId);

  try {
    await appGoalRepository.deleteById(id);
  } catch (error) {
    if (appGoalRepository.isPrismaKnownError(error, appGoalRepository.RECORD_NOT_FOUND_ERROR)) {
      throw appGoalNotFound();
    }

    throw error;
  }
}
