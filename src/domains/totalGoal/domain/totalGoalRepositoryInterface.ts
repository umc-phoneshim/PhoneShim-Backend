import type { NewTotalGoal, TotalGoal, UpdateTotalGoalPayload } from './totalGoalEntity';

export default interface TotalGoalRepositoryInterface {
  save(totalGoal: NewTotalGoal): Promise<TotalGoal>;
  findByUserId(userId: string): Promise<TotalGoal | null>;
  findById(id: string): Promise<TotalGoal | null>;
  update(id: string, payload: UpdateTotalGoalPayload): Promise<TotalGoal>;
  deleteById(id: string): Promise<void>;
}
