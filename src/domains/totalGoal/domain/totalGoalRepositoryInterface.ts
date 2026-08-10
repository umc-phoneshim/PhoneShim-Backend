import type { TotalGoal, NewTotalGoal, ValidatedTotalGoalUpdate } from './totalGoalEntity';

export default interface TotalGoalRepositoryInterface {
  findByUserId(userId: string): Promise<TotalGoal | null>;
  save(totalGoal: NewTotalGoal): Promise<TotalGoal>;
  updateByUserId(userId: string, payload: ValidatedTotalGoalUpdate): Promise<TotalGoal>;
}
