import { BadRequestError } from '../../../shared/errors/appError';

export type UsageLog = {
  id: string;
  userId: string;
  monitoredAppId: string;
  date: Date;
  usedMinutes: number;
  entryCount: number;
  createdAt: Date;
  updatedAt: Date;
};

// 안드로이드가 오늘 하루의 누적 사용시간/실행횟수를 주기적으로 통째로 보내면
// (userId, monitoredAppId, date) 기준 upsert합니다. v1은 세션 단위가 아닌
// 하루 집계 기준입니다 (ERD.md 참고).
export type RecordUsageLogPayload = {
  userId: string;
  monitoredAppId: string;
  date?: string | Date;
  usedMinutes: number;
  entryCount: number;
};

export type NewUsageLog = {
  userId: string;
  monitoredAppId: string;
  date: Date;
  usedMinutes: number;
  entryCount: number;
};

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

// date를 별도로 넘기지 않으면 서버 기준 오늘(KST) 날짜를 사용합니다.
export function getKstDateOnly(input?: string | Date): Date {
  const base = input ? new Date(input) : new Date();

  if (Number.isNaN(base.getTime())) {
    throw new BadRequestError('date must be a valid date', 'VALIDATION_ERROR');
  }

  const kst = new Date(base.getTime() + KST_OFFSET_MS);

  return new Date(Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate()));
}

export function createUsageLogEntity(payload: RecordUsageLogPayload): NewUsageLog {
  if (!payload.userId.trim()) {
    throw new BadRequestError('userId is required', 'VALIDATION_ERROR');
  }

  if (!payload.monitoredAppId.trim()) {
    throw new BadRequestError('monitoredAppId is required', 'VALIDATION_ERROR');
  }

  if (
    !Number.isFinite(payload.usedMinutes) ||
    !Number.isInteger(payload.usedMinutes) ||
    payload.usedMinutes < 0
  ) {
    throw new BadRequestError(
      'usedMinutes must be a non-negative integer',
      'VALIDATION_ERROR'
    );
  }

  if (
    !Number.isFinite(payload.entryCount) ||
    !Number.isInteger(payload.entryCount) ||
    payload.entryCount < 0
  ) {
    throw new BadRequestError('entryCount must be a non-negative integer', 'VALIDATION_ERROR');
  }

  return {
    userId: payload.userId,
    monitoredAppId: payload.monitoredAppId,
    date: getKstDateOnly(payload.date),
    usedMinutes: payload.usedMinutes,
    entryCount: payload.entryCount
  };
}

// SAFE: 목표치의 80% 미만, WARNING: 80% 이상 100% 미만,
// EXCEEDED: 목표치 도달/초과, NO_GOAL: 목표가 아직 설정되지 않음.
export type AppUsageStatus = 'SAFE' | 'WARNING' | 'EXCEEDED' | 'NO_GOAL';

export type MonitoredAppUsageStatus = {
  monitoredAppId: string;
  appName: string;
  packageName: string;
  appIcon: string | null;
  sortOrder: number;
  targetMinutes: number | null;
  targetCount: number | null;
  usedMinutes: number;
  entryCount: number;
  status: AppUsageStatus;
};

const WARNING_THRESHOLD_RATIO = 0.8;

// TODO: 현재는 targetMinutes(사용 시간) 기준으로만 status를 판단합니다.
// AppGoal.targetCount(진입 횟수 목표)는 화면에 숫자로만 표시되고 색상 판단에는
// 반영되지 않습니다. 안드로이드/기획 쪽에서 "횟수도 색상에 반영할지" 정해지면
// 이 함수 시그니처에 entryCount/targetCount를 추가해서 반영하면 됩니다.
export function calculateUsageStatus(
  usedMinutes: number,
  targetMinutes: number | null
): AppUsageStatus {
  if (targetMinutes === null || targetMinutes <= 0) {
    return 'NO_GOAL';
  }

  if (usedMinutes >= targetMinutes) {
    return 'EXCEEDED';
  }

  if (usedMinutes >= targetMinutes * WARNING_THRESHOLD_RATIO) {
    return 'WARNING';
  }

  return 'SAFE';
}
