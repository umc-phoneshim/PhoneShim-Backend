export type CreateTotalGoalRequestBody = {
  userId: string;
  targetMinutes: number;
  restrictAfter?: boolean;
};

export type UpdateTotalGoalRequestBody = {
  targetMinutes?: number;
  restrictAfter?: boolean;
};
