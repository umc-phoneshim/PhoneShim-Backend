export type StartTimerRequest = {
  userId: string;
};

export type StopTimerRequest = {
  timerId: string;
};

export type TimerResponse = {
  id: string | null;
  userId: string;
  startedAt: string;
  status: 'running' | 'stopped';
};

export type StopTimerResponse = {
  timerId: string;
  stoppedAt: string;
};

export const startTimerRequestSchema = {
  userId: {
    type: 'string',
    required: true,
    minLength: 1
  }
} as const;

export const stopTimerRequestSchema = {
  timerId: {
    type: 'string',
    required: true,
    minLength: 1
  }
} as const;
