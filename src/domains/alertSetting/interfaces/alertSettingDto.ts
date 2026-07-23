export type UpdateAlertSettingRequest = {
  alertTimeMinutes: number;
};

export const updateAlertSettingRequestSchema = {
  alertTimeMinutes: {
    type: 'number',
    required: true
  }
} as const;
