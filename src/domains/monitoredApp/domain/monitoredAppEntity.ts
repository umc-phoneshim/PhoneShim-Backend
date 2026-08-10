import { BadRequestError } from '../../../shared/errors/appError';

export type MonitoredApp = {
  id: string;
  userId: string;
  packageName: string;
  appName: string;
  appIcon: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateMonitoredAppPayload = {
  userId: string;
  packageName: string;
  appName: string;
  appIcon?: string | null;
  sortOrder?: number;
};

export type UpdateMonitoredAppPayload = {
  packageName?: string;
  appName?: string;
  appIcon?: string | null;
  sortOrder?: number;
};

export type NewMonitoredApp = {
  userId: string;
  packageName: string;
  appName: string;
  appIcon: string | null;
  sortOrder?: number;
};

export type ValidatedMonitoredAppUpdate = {
  packageName?: string;
  appName?: string;
  appIcon?: string | null;
  sortOrder?: number;
};

const normalizeRequiredString = (value: string, fieldName: string): string => {
  const normalized = value.trim();

  if (!normalized) {
    throw new BadRequestError(`${fieldName} is required`, 'VALIDATION_ERROR');
  }

  return normalized;
};

const normalizeOptionalString = (value: string | null | undefined): string | null | undefined => {
  if (value === undefined || value === null) {
    return value;
  }

  const normalized = value.trim();

  return normalized.length > 0 ? normalized : null;
};

const validateSortOrder = (sortOrder: number | undefined): number | undefined => {
  if (sortOrder === undefined) {
    return undefined;
  }

  if (!Number.isInteger(sortOrder) || sortOrder < 0) {
    throw new BadRequestError('sortOrder must be a non-negative integer', 'VALIDATION_ERROR');
  }

  return sortOrder;
};

export function createMonitoredAppEntity(payload: CreateMonitoredAppPayload): NewMonitoredApp {
  return {
    userId: normalizeRequiredString(payload.userId, 'userId'),
    packageName: normalizeRequiredString(payload.packageName, 'packageName'),
    appName: normalizeRequiredString(payload.appName, 'appName'),
    appIcon: normalizeOptionalString(payload.appIcon) ?? null,
    sortOrder: validateSortOrder(payload.sortOrder)
  };
}

export function createMonitoredAppUpdate(
  payload: UpdateMonitoredAppPayload
): ValidatedMonitoredAppUpdate {
  const update: ValidatedMonitoredAppUpdate = {};

  if (payload.packageName !== undefined) {
    update.packageName = normalizeRequiredString(payload.packageName, 'packageName');
  }

  if (payload.appName !== undefined) {
    update.appName = normalizeRequiredString(payload.appName, 'appName');
  }

  if (payload.appIcon !== undefined) {
    update.appIcon = normalizeOptionalString(payload.appIcon) ?? null;
  }

  if (payload.sortOrder !== undefined) {
    update.sortOrder = validateSortOrder(payload.sortOrder);
  }

  return update;
}
