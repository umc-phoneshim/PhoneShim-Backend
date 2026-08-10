import { BadRequestError } from '../../../shared/errors/appError';

export type UpdateUserNameMotivPayload = {
  name?: string;
  motivation?: string;
};

export type ValidatedUserNameMotivUpdate = {
  name?: string;
  motivation?: string;
};

const MAX_MOTIVATION_LENGTH = 100;

const normalizeUserName = (value: string): string => {
  const normalized = value.trim();

  if (!normalized) {
    throw new BadRequestError(`name is required`, 'VALIDATION_ERROR');
  }

  return normalized;
};

const normalizeUserMotivation = (value: string): string => {
  const normalized = value.trim();

  if (!normalized) {
    throw new BadRequestError(`motivation is required`, 'VALIDATION_ERROR');
  }

  if (normalized.length > MAX_MOTIVATION_LENGTH) {
    throw new BadRequestError(
      `motivation must be no more than ${MAX_MOTIVATION_LENGTH} characters`,
      'VALIDATION_ERROR'
    );
  }

  return normalized;
};

export function createUserNameMotivUpdate(
  payload: UpdateUserNameMotivPayload
): ValidatedUserNameMotivUpdate {
  const update: ValidatedUserNameMotivUpdate = {};

  if (payload.name !== undefined) {
    update.name = normalizeUserName(payload.name);
  }

  if (payload.motivation !== undefined) {
    update.motivation = normalizeUserMotivation(payload.motivation);
  }

  if (Object.keys(update).length === 0) {
    throw new BadRequestError('At least one field is required', 'VALIDATION_ERROR');
  }

  return update;
}
