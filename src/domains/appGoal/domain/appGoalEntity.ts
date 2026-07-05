import AppError from '../../../shared/errors/AppError';

export type AppGoal = {
  id: string;
  monitoredAppId: string;
  targetMinutes: number;
  targetCount: number;
  restrictAfter: boolean;
  goalReason: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateAppGoalPayload = {
  monitoredAppId: string;
  targetMinutes: number;
  targetCount: number;
  restrictAfter?: boolean;
  goalReason?: string | null;
};

export type UpdateAppGoalPayload = {
  targetMinutes?: number;
  targetCount?: number;
  restrictAfter?: boolean;
  goalReason?: string | null;
};

export type NewAppGoal = {
  monitoredAppId: string;
  targetMinutes: number;
  targetCount: number;
  restrictAfter: boolean;
  goalReason: string | null;
};

export function createAppGoal(payload: CreateAppGoalPayload): NewAppGoal {
  if (!payload.monitoredAppId) {
    throw new AppError('monitoredAppId는 필수입니다.', 400, 'INVALID_MONITORED_APP_ID');
  }

  if (
    payload.targetMinutes === undefined ||
    payload.targetMinutes === null ||
    payload.targetMinutes <= 0
  ) {
    throw new AppError('targetMinutes는 0보다 큰 숫자여야 합니다.', 400, 'INVALID_TARGET_MINUTES');
  }

  if (
    payload.targetCount === undefined ||
    payload.targetCount === null ||
    payload.targetCount <= 0
  ) {
    throw new AppError('targetCount는 0보다 큰 숫자여야 합니다.', 400, 'INVALID_TARGET_COUNT');
  }

  return {
    monitoredAppId: payload.monitoredAppId,
    targetMinutes: payload.targetMinutes,
    targetCount: payload.targetCount,
    restrictAfter: payload.restrictAfter ?? false,
    goalReason: payload.goalReason ?? null
  };
}

export function applyAppGoalUpdate(payload: UpdateAppGoalPayload): UpdateAppGoalPayload {
  if (payload.targetMinutes !== undefined && payload.targetMinutes <= 0) {
    throw new AppError('targetMinutes는 0보다 큰 숫자여야 합니다.', 400, 'INVALID_TARGET_MINUTES');
  }

  if (payload.targetCount !== undefined && payload.targetCount <= 0) {
    throw new AppError('targetCount는 0보다 큰 숫자여야 합니다.', 400, 'INVALID_TARGET_COUNT');
  }

  return {
    ...(payload.targetMinutes !== undefined && { targetMinutes: payload.targetMinutes }),
    ...(payload.targetCount !== undefined && { targetCount: payload.targetCount }),
    ...(payload.restrictAfter !== undefined && { restrictAfter: payload.restrictAfter }),
    ...(payload.goalReason !== undefined && { goalReason: payload.goalReason })
  };
}
