import { AppError, BadRequestError, NotFoundError } from '../../../shared/errors/appError';

import {
  createMonitoredAppEntity,
  createMonitoredAppUpdate,
  type CreateMonitoredAppPayload,
  type UpdateMonitoredAppPayload
} from '../domain/monitoredAppEntity';
import * as monitoredAppRepository from '../infrastructure/monitoredAppRepository';

const MAX_MONITORED_APP_COUNT = 5;

const monitoredAppNotFound = () =>
  new NotFoundError('Monitored app was not found', 'MONITORED_APP_NOT_FOUND');

const monitoredAppAlreadyExists = () =>
  new AppError(409, 'MONITORED_APP_ALREADY_EXISTS', 'Monitored app already exists');

const ensureUserId = (userId: string) => {
  if (!userId.trim()) {
    throw new BadRequestError('userId is required', 'VALIDATION_ERROR');
  }
};

const ensurePackageNameIsUnique = async (
  userId: string,
  packageName: string,
  exceptId?: string
) => {
  const existing = await monitoredAppRepository.findByPackageNameAndUserId(packageName, userId);

  if (existing && existing.id !== exceptId) {
    throw monitoredAppAlreadyExists();
  }
};

export async function createMonitoredApp(payload: CreateMonitoredAppPayload) {
  const monitoredApp = createMonitoredAppEntity(payload);
  const currentCount = await monitoredAppRepository.countByUserId(monitoredApp.userId);

  if (currentCount >= MAX_MONITORED_APP_COUNT) {
    throw new BadRequestError(
      'A user can register up to 5 monitored apps',
      'MONITORED_APP_LIMIT_EXCEEDED'
    );
  }

  await ensurePackageNameIsUnique(monitoredApp.userId, monitoredApp.packageName);

  try {
    return await monitoredAppRepository.save({
      ...monitoredApp,
      sortOrder: monitoredApp.sortOrder ?? currentCount
    });
  } catch (error) {
    if (monitoredAppRepository.isPrismaKnownError(error, monitoredAppRepository.UNIQUE_CONSTRAINT_ERROR)) {
      throw monitoredAppAlreadyExists();
    }

    throw error;
  }
}

export async function getMonitoredApps(userId: string) {
  ensureUserId(userId);

  return monitoredAppRepository.findAllByUserId(userId);
}

export async function getMonitoredAppById(id: string, userId: string) {
  ensureUserId(userId);

  const monitoredApp = await monitoredAppRepository.findByIdAndUserId(id, userId);

  if (!monitoredApp) {
    throw monitoredAppNotFound();
  }

  return monitoredApp;
}

export async function updateMonitoredApp(
  id: string,
  userId: string,
  payload: UpdateMonitoredAppPayload
) {
  const current = await getMonitoredAppById(id, userId);
  const update = createMonitoredAppUpdate(payload);

  if (update.packageName !== undefined) {
    await ensurePackageNameIsUnique(userId, update.packageName, current.id);
  }

  try {
    return await monitoredAppRepository.update(id, userId, update);
  } catch (error) {
    if (monitoredAppRepository.isPrismaKnownError(error, monitoredAppRepository.UNIQUE_CONSTRAINT_ERROR)) {
      throw monitoredAppAlreadyExists();
    }

    if (monitoredAppRepository.isPrismaKnownError(error, monitoredAppRepository.RECORD_NOT_FOUND_ERROR)) {
      throw monitoredAppNotFound();
    }

    throw error;
  }
}

export async function deleteMonitoredApp(id: string, userId: string) {
  await getMonitoredAppById(id, userId);

  try {
    await monitoredAppRepository.deleteByIdAndUserId(id, userId);
  } catch (error) {
    if (monitoredAppRepository.isPrismaKnownError(error, monitoredAppRepository.RECORD_NOT_FOUND_ERROR)) {
      throw monitoredAppNotFound();
    }

    throw error;
  }
}
