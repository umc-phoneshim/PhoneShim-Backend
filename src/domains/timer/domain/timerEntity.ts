export type CreateTimerPayload = {
  userId?: string | number;
};

export type Timer = {
  userId: string | number | null;
  startedAt: string;
  status: 'running' | 'stopped';
};

export function createTimer(payload: CreateTimerPayload = {}): Timer {
  return {
    userId: payload.userId || null,
    startedAt: new Date().toISOString(),
    status: 'running'
  };
}
