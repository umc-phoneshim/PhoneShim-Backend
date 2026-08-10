export type CreateUsageSessionRequest = {
  monitoredAppId: string;
  startTime: string;
  endTime: string;
};

export const createUsageSessionRequestSchema = {
  monitoredAppId: {
    type: 'string',
    required: true,
    minLength: 1
  },
  startTime: {
    type: 'string',
    required: true,
    minLength: 1
  },
  endTime: {
    type: 'string',
    required: true,
    minLength: 1
  }
} as const;
