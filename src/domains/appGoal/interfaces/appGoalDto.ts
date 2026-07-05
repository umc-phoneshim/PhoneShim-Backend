export type CreateAppGoalRequestBody = {
  monitoredAppId: string;
  targetMinutes: number;
  targetCount: number;
  restrictAfter?: boolean;
  goalReason?: string | null;
};

export type UpdateAppGoalRequestBody = {
  targetMinutes?: number;
  targetCount?: number;
  restrictAfter?: boolean;
  goalReason?: string | null;
};
