import type { NewUsageReason, UsageReason } from './usageReasonEntity';

export default interface UsageReasonRepositoryInterface {
  save(usageReason: NewUsageReason): Promise<UsageReason>;
}
