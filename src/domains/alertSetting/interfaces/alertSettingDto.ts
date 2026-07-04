export type CreateAlertSettingRequestBody = {
  userId: string;
  alertTime?: string;
};

export type UpdateAlertSettingRequestBody = {
  alertTime?: string;
};
