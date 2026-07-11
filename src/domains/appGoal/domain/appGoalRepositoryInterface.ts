import type { AppGoal, NewAppGoal, ValidatedAppGoalUpdate } from './appGoalEntity';

export default interface AppGoalRepositoryInterface {
  findByMonitoredAppId(monitoredAppId: string): Promise<AppGoal | null>;
  findAllByMonitoredAppIds(monitoredAppIds: string[]): Promise<AppGoal[]>;
  save(appGoal: NewAppGoal): Promise<AppGoal>;
  update(monitoredAppId: string, payload: ValidatedAppGoalUpdate): Promise<AppGoal>;
  deleteByMonitoredAppId(monitoredAppId: string): Promise<void>;
}
