export type DailyUsageSummary = {
  date: string;
  targetMinutes: number | null;
  usedMinutes: number;
  remainingMinutes: number | null;
  isExceeded: boolean;
};

const KST_OFFSET_MINUTES = 9 * 60;

export function getTodayInKst(): Date {
  const now = new Date();
  const kstNow = new Date(now.getTime() + KST_OFFSET_MINUTES * 60 * 1000);

  return new Date(Date.UTC(kstNow.getUTCFullYear(), kstNow.getUTCMonth(), kstNow.getUTCDate()));
}

export function buildDailyUsageSummary(params: {
  date: Date;
  usedMinutes: number;
  targetMinutes: number | null;
}): DailyUsageSummary {
  const { date, usedMinutes, targetMinutes } = params;

  return {
    date: date.toISOString().slice(0, 10),
    targetMinutes,
    usedMinutes,
    remainingMinutes: targetMinutes === null ? null : targetMinutes - usedMinutes,
    isExceeded: targetMinutes === null ? false : usedMinutes > targetMinutes
  };
}
