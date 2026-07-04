import type { AppGoal, NewAppGoal, UpdateAppGoalPayload } from './appGoalEntity';

export default interface AppGoalRepositoryInterface {
  save(appGoal: NewAppGoal): Promise<AppGoal>;
  findByMonitoredAppId(monitoredAppId: string): Promise<AppGoal | null>;
  findById(id: string): Promise<AppGoal | null>;
  update(id: string, payload: UpdateAppGoalPayload): Promise<AppGoal>;
  deleteById(id: string): Promise<void>;
}
