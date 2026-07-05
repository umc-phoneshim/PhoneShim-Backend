import AppError from '../../../shared/errors/AppError';

export type MonitoredApp = {
  id: string;
  userId: string;
  appName: string;
  appIcon: string | null;
  order: number;
  createdAt: Date;
};

export type CreateMonitoredAppPayload = {
  userId: string;
  appName: string;
  appIcon?: string | null;
  order: number;
};

export type UpdateMonitoredAppPayload = {
  appName?: string;
  appIcon?: string | null;
  order?: number;
};

export type NewMonitoredApp = {
  userId: string;
  appName: string;
  appIcon: string | null;
  order: number;
};

export function createMonitoredApp(payload: CreateMonitoredAppPayload): NewMonitoredApp {
  if (!payload.userId) {
    throw new AppError('userId는 필수입니다.', 400, 'INVALID_USER_ID');
  }

  if (!payload.appName || payload.appName.trim().length === 0) {
    throw new AppError('appName은 필수입니다.', 400, 'INVALID_APP_NAME');
  }

  if (payload.order === undefined || payload.order === null || payload.order < 0) {
    throw new AppError('order는 0 이상의 숫자여야 합니다.', 400, 'INVALID_ORDER');
  }

  return {
    userId: payload.userId,
    appName: payload.appName.trim(),
    appIcon: payload.appIcon ?? null,
    order: payload.order
  };
}

export function applyMonitoredAppUpdate(payload: UpdateMonitoredAppPayload): UpdateMonitoredAppPayload {
  if (payload.appName !== undefined && payload.appName.trim().length === 0) {
    throw new AppError('appName은 빈 값일 수 없습니다.', 400, 'INVALID_APP_NAME');
  }

  if (payload.order !== undefined && payload.order < 0) {
    throw new AppError('order는 0 이상의 숫자여야 합니다.', 400, 'INVALID_ORDER');
  }

  return {
    ...(payload.appName !== undefined && { appName: payload.appName.trim() }),
    ...(payload.appIcon !== undefined && { appIcon: payload.appIcon }),
    ...(payload.order !== undefined && { order: payload.order })
  };
}
