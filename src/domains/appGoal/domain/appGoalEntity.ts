import { BadRequestError } from '../../../shared/errors/appError';

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

export type ValidatedAppGoalUpdate = {
  targetMinutes?: number;
  targetCount?: number;
  restrictAfter?: boolean;
  goalReason?: string | null;
};

// ERD.md 제약: target_minutes는 10~1430분(23시간 50분) 범위
const MIN_TARGET_MINUTES = 10;
const MAX_TARGET_MINUTES = 1430;
const MAX_GOAL_REASON_LENGTH = 100;

const validateTargetMinutes = (value: number): number => {
  if (!Number.isInteger(value) || value < MIN_TARGET_MINUTES || value > MAX_TARGET_MINUTES) {
    throw new BadRequestError(
      `targetMinutes must be an integer between ${MIN_TARGET_MINUTES} and ${MAX_TARGET_MINUTES}`,
      'VALIDATION_ERROR'
    );
  }

  return value;
};

const validateTargetCount = (value: number): number => {
  if (!Number.isInteger(value) || value < 1) {
    throw new BadRequestError('targetCount must be an integer of 1 or more', 'VALIDATION_ERROR');
  }

  return value;
};

const normalizeGoalReason = (value: string | null | undefined): string | null | undefined => {
  if (value === undefined || value === null) {
    return value;
  }

  const normalized = value.trim();

  if (normalized.length > MAX_GOAL_REASON_LENGTH) {
    throw new BadRequestError(
      `goalReason must be at most ${MAX_GOAL_REASON_LENGTH} characters`,
      'VALIDATION_ERROR'
    );
  }

  return normalized.length > 0 ? normalized : null;
};

export function createAppGoalEntity(payload: CreateAppGoalPayload): NewAppGoal {
  if (!payload.monitoredAppId.trim()) {
    throw new BadRequestError('monitoredAppId is required', 'VALIDATION_ERROR');
  }

  return {
    monitoredAppId: payload.monitoredAppId,
    targetMinutes: validateTargetMinutes(payload.targetMinutes),
    targetCount: validateTargetCount(payload.targetCount),
    restrictAfter: payload.restrictAfter ?? false,
    goalReason: normalizeGoalReason(payload.goalReason) ?? null
  };
}

export function createAppGoalUpdate(payload: UpdateAppGoalPayload): ValidatedAppGoalUpdate {
  const update: ValidatedAppGoalUpdate = {};

  if (payload.targetMinutes !== undefined) {
    update.targetMinutes = validateTargetMinutes(payload.targetMinutes);
  }

  if (payload.targetCount !== undefined) {
    update.targetCount = validateTargetCount(payload.targetCount);
  }

  if (payload.restrictAfter !== undefined) {
    update.restrictAfter = payload.restrictAfter;
  }

  if (payload.goalReason !== undefined) {
    update.goalReason = normalizeGoalReason(payload.goalReason) ?? null;
  }

  return update;
}
