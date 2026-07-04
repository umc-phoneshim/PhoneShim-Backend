import type { MonitoredApp, NewMonitoredApp, UpdateMonitoredAppPayload } from './monitoredAppEntity';

export default interface MonitoredAppRepositoryInterface {
  save(monitoredApp: NewMonitoredApp): Promise<MonitoredApp>;
  findAllByUserId(userId: string): Promise<MonitoredApp[]>;
  findById(id: string): Promise<MonitoredApp | null>;
  update(id: string, payload: UpdateMonitoredAppPayload): Promise<MonitoredApp>;
  deleteById(id: string): Promise<void>;
}
