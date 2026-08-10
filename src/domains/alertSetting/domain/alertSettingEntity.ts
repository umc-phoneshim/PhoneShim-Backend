import { BadRequestError } from '../../../shared/errors/appError';

export type AlertSetting = {
  id: string;
  userId: string;
  enabled: boolean;
  alertTimeMinutes: number;
  createdAt: Date;
  updatedAt: Date;
};

const MIN_ALERT_TIME_MINUTES = 1320;
const MAX_ALERT_TIME_MINUTES = 1439;

export function validateAlertTimeMinutes(value: number): number {
  if (
    !Number.isInteger(value) ||
    value < MIN_ALERT_TIME_MINUTES ||
    value > MAX_ALERT_TIME_MINUTES
  ) {
    throw new BadRequestError(
      'alertTimeMinutes must be between 1320 and 1439',
      'INVALID_ALERT_TIME'
    );
  }

  return value;
}
