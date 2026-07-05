import AppError from '../../../shared/errors/AppError';

const ALERT_TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export type AlertSetting = {
  id: string;
  userId: string;
  alertTime: string;
  updatedAt: Date;
};

export type CreateAlertSettingPayload = {
  userId: string;
  alertTime?: string;
};

export type UpdateAlertSettingPayload = {
  alertTime?: string;
};

export type NewAlertSetting = {
  userId: string;
  alertTime: string;
};

function validateAlertTime(alertTime: string) {
  if (!ALERT_TIME_PATTERN.test(alertTime)) {
    throw new AppError('alertTime은 HH:mm 형식이어야 합니다.', 400, 'INVALID_ALERT_TIME');
  }
}

export function createAlertSetting(payload: CreateAlertSettingPayload): NewAlertSetting {
  if (!payload.userId) {
    throw new AppError('userId는 필수입니다.', 400, 'INVALID_USER_ID');
  }

  const alertTime = payload.alertTime ?? '22:00';
  validateAlertTime(alertTime);

  return {
    userId: payload.userId,
    alertTime
  };
}

export function applyAlertSettingUpdate(
  payload: UpdateAlertSettingPayload
): UpdateAlertSettingPayload {
  if (payload.alertTime !== undefined) {
    validateAlertTime(payload.alertTime);
  }

  return {
    ...(payload.alertTime !== undefined && { alertTime: payload.alertTime })
  };
}
