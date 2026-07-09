export type CreateAppGoalRequest = {
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
  targetMinutes: {
    type: 'number',
    required: true
  },
  targetCount: {
    type: 'number',
    required: true
  }
} as const;

export const updateAppGoalRequestSchema = {
  targetMinutes: {
    type: 'number'
  },
  targetCount: {
    type: 'number'
  }
} as const;
