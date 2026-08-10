import { BadRequestError } from '../../../shared/errors/appError';

export type TotalGoal = {
  id: string;
  userId: string;
  targetMinutes: number;
  restrictAfter: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateTotalGoalPayload = {
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

export type ValidatedTotalGoalUpdate = {
  targetMinutes?: number;
  restrictAfter?: boolean;
};

// API_SPEC.md §10 공통 정책: targetMinutes는 10~1430분(23시간 50분)만 허용
const MIN_TARGET_MINUTES = 10;
const MAX_TARGET_MINUTES = 1430;

const validateTargetMinutes = (value: number): number => {
  if (!Number.isInteger(value) || value < MIN_TARGET_MINUTES || value > MAX_TARGET_MINUTES) {
    throw new BadRequestError(
      `targetMinutes must be an integer between ${MIN_TARGET_MINUTES} and ${MAX_TARGET_MINUTES}`,
      'INVALID_TARGET_MINUTES'
    );
  }

  return value;
};

export function createTotalGoalEntity(userId: string, payload: CreateTotalGoalPayload): NewTotalGoal {
  return {
    userId,
    targetMinutes: validateTargetMinutes(payload.targetMinutes),
    restrictAfter: payload.restrictAfter ?? false
  };
}

export function createTotalGoalUpdate(payload: UpdateTotalGoalPayload): ValidatedTotalGoalUpdate {
  const update: ValidatedTotalGoalUpdate = {};

  if (payload.targetMinutes !== undefined) {
    update.targetMinutes = validateTargetMinutes(payload.targetMinutes);
  }

  if (payload.restrictAfter !== undefined) {
    update.restrictAfter = payload.restrictAfter;
  }

  if (Object.keys(update).length === 0) {
    throw new BadRequestError('At least one field is required', 'VALIDATION_ERROR');
  }

  return update;
}
