import type {
  MonitoredApp,
  NewMonitoredApp,
  ValidatedMonitoredAppUpdate
} from './monitoredAppEntity';

export default interface MonitoredAppRepositoryInterface {
  countByUserId(userId: string): Promise<number>;
  findAllByUserId(userId: string): Promise<MonitoredApp[]>;
  findByIdAndUserId(id: string, userId: string): Promise<MonitoredApp | null>;
  findByPackageNameAndUserId(
    packageName: string,
    userId: string
  ): Promise<MonitoredApp | null>;
  save(monitoredApp: NewMonitoredApp): Promise<MonitoredApp>;
  update(
    id: string,
    userId: string,
    payload: ValidatedMonitoredAppUpdate
  ): Promise<MonitoredApp>;
  deleteByIdAndUserId(id: string, userId: string): Promise<void>;
}
