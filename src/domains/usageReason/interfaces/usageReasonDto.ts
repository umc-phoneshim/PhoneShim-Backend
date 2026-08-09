export type CreateUsageReasonRequest = {
  monitoredAppId: string;
  usageLogId?: string;
  date: string;
  timeRangeStart: string;
  timeRangeEnd: string;
  reasonCodes: string[];
};

export const createUsageReasonRequestSchema = {
  monitoredAppId: {
    type: 'string',
    required: true,
    minLength: 1
  },
  usageLogId: {
    type: 'string'
  },
  date: {
    type: 'string',
    required: true,
    minLength: 1
  },
  timeRangeStart: {
    type: 'string',
    required: true,
    minLength: 1
  },
  timeRangeEnd: {
    type: 'string',
    required: true,
    minLength: 1
  },
  reasonCodes: {
    type: 'stringArray',
    required: true
  }
} as const;
