export type CreateTotalGoalRequest = {
  targetMinutes: number;
  restrictAfter?: boolean;
};

export type UpdateTotalGoalRequest = {
  targetMinutes?: number;
  restrictAfter?: boolean;
};

export const createTotalGoalRequestSchema = {
  targetMinutes: {
    type: 'number',
    required: true
  },
  restrictAfter: {
    type: 'boolean'
  }
} as const;

export const updateTotalGoalRequestSchema = {
  targetMinutes: {
    type: 'number'
  },
  restrictAfter: {
    type: 'boolean'
  }
} as const;
