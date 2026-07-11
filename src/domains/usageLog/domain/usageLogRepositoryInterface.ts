import type { NewUsageLog, UsageLog } from './usageLogEntity';

export type DailyUsageSummary = {
  monitoredAppId: string;
  usedMinutes: number;
  entryCount: number;
};

export default interface UsageLogRepositoryInterface {
  upsertDaily(usageLog: NewUsageLog): Promise<UsageLog>;
  findAllByUserIdAndDate(userId: string, monitoredAppIds: string[], date: Date): Promise<DailyUsageSummary[]>;
}
