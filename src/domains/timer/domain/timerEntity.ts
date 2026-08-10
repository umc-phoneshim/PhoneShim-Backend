export type CreateTimerPayload = {
  userId: string;
};

export type Timer = {
  userId: string;
  startedAt: string;
  status: 'running' | 'stopped';
};

export function createTimer(payload: CreateTimerPayload): Timer {
  return {
    userId: payload.userId,
    startedAt: new Date().toISOString(),
    status: 'running'
  };
}
