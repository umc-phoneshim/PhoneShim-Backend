export type UpsertUsageLogRequest = {
  monitoredAppId: string;
  date: string;
  usedMinutes: number;
  entryCount: number;
};

export const upsertUsageLogRequestSchema = {
  monitoredAppId: {
    type: 'string',
    required: true,
    minLength: 1
  },
  date: {
    type: 'string',
    required: true,
    minLength: 1
  },
  usedMinutes: {
    type: 'number',
    required: true
  },
  entryCount: {
    type: 'number',
    required: true
  }
} as const;
