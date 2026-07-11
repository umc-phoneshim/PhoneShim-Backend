export type CreateAppGoalRequest = {
  monitoredAppId: string;
  targetMinutes: number;
  targetCount: number;
  restrictAfter?: boolean;
  goalReason?: string | null;
};

export type UpdateAppGoalRequest = {
  targetMinutes?: number;
  targetCount?: number;
  restrictAfter?: boolean;
  goalReason?: string | null;
};

export const createAppGoalRequestSchema = {
  monitoredAppId: {
    type: 'string',
    required: true,
    minLength: 1
  },
  targetMinutes: {
    type: 'number',
    required: true
  },
  targetCount: {
    type: 'number',
    required: true
  },
  restrictAfter: {
    type: 'boolean'
  },
  goalReason: {
    type: 'string'
  }
} as const;

export const updateAppGoalRequestSchema = {
  targetMinutes: {
    type: 'number'
  },
  targetCount: {
    type: 'number'
  },
  restrictAfter: {
    type: 'boolean'
  },
  goalReason: {
    type: 'string'
  }
} as const;
