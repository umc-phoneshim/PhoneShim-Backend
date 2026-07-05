import AppError from '../../../shared/errors/AppError';

export type TotalGoal = {
  id: string;
  userId: string;
  targetMinutes: number;
  restrictAfter: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateTotalGoalPayload = {
  userId: string;
  targetMinutes: number;
  restrictAfter?: boolean;
};

export type UpdateTotalGoalPayload = {
  targetMinutes?: number;
  restrictAfter?: boolean;
};

export type NewTotalGoal = {
  userId: string;
  targetMinutes: number;
  restrictAfter: boolean;
};

export function createTotalGoal(payload: CreateTotalGoalPayload): NewTotalGoal {
  if (!payload.userId) {
    throw new AppError('userId는 필수입니다.', 400, 'INVALID_USER_ID');
  }

  if (
    payload.targetMinutes === undefined ||
    payload.targetMinutes === null ||
    payload.targetMinutes <= 0
  ) {
    throw new AppError('targetMinutes는 0보다 큰 숫자여야 합니다.', 400, 'INVALID_TARGET_MINUTES');
  }

  return {
    userId: payload.userId,
    targetMinutes: payload.targetMinutes,
    restrictAfter: payload.restrictAfter ?? false
  };
}

export function applyTotalGoalUpdate(payload: UpdateTotalGoalPayload): UpdateTotalGoalPayload {
  if (payload.targetMinutes !== undefined && payload.targetMinutes <= 0) {
    throw new AppError('targetMinutes는 0보다 큰 숫자여야 합니다.', 400, 'INVALID_TARGET_MINUTES');
  }

  return {
    ...(payload.targetMinutes !== undefined && { targetMinutes: payload.targetMinutes }),
    ...(payload.restrictAfter !== undefined && { restrictAfter: payload.restrictAfter })
  };
}
