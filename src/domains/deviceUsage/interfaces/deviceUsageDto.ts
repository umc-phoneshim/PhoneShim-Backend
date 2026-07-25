export type RecordDeviceUsageRequest = {
  date?: string;
  totalUsedMinutes: number;
};

export const recordDeviceUsageRequestSchema = {
  date: {
    type: 'string'
  },
  totalUsedMinutes: {
    type: 'number',
    required: true
  }
} as const;
