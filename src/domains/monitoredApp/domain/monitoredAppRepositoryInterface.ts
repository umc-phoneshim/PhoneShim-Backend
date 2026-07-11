import type { MonitoredApp, ValidatedMonitoredAppUpdate } from './monitoredAppEntity';

export default interface MonitoredAppRepositoryInterface {
  findAllByUserId(userId: string): Promise<MonitoredApp[]>;
  findByIdAndUserId(id: string, userId: string): Promise<MonitoredApp | null>;
  findByPackageNameAndUserId(packageName: string, userId: string): Promise<MonitoredApp | null>;
  update(id: string, userId: string, payload: ValidatedMonitoredAppUpdate): Promise<MonitoredApp>;
  deleteByIdAndUserId(id: string, userId: string): Promise<void>;
}
