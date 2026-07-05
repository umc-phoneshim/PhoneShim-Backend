import type { RestrictMode } from '@prisma/client';

export type CreateReminderRequestBody = {
  date: string;
  title: string;
  startTime: string;
  endTime: string;
  restrictMode?: RestrictMode;
  restrictedAppIds?: string[];
};

export type UpdateReminderRequestBody = {
  date?: string;
  title?: string;
  startTime?: string;
  endTime?: string;
  restrictMode?: RestrictMode;
  restrictedAppIds?: string[];
};
