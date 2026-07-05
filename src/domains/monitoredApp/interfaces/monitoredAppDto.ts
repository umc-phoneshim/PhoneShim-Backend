export type CreateMonitoredAppRequestBody = {
  appName: string;
  appIcon?: string | null;
  order: number;
};

export type UpdateMonitoredAppRequestBody = {
  appName?: string;
  appIcon?: string | null;
  order?: number;
};
