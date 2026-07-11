export type RecordUsageLogRequest = {
  monitoredAppId: string;
  date?: string;
  usedMinutes: number;
  entryCount: number;
};

export const recordUsageLogRequestSchema = {
  monitoredAppId: {
    type: 'string',
    required: true,
    minLength: 1
  },
  date: {
    type: 'string'
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
