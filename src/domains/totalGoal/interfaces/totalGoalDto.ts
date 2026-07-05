export type CreateTotalGoalRequestBody = {
  targetMinutes: number;
  restrictAfter?: boolean;
};

export type UpdateTotalGoalRequestBody = {
  targetMinutes?: number;
  restrictAfter?: boolean;
};
