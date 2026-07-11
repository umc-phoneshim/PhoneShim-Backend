export type CreateMonitoredAppRequest = {
  packageName: string;
  appName: string;
  appIcon?: string | null;
  sortOrder?: number;
};

export type UpdateMonitoredAppRequest = {
  packageName?: string;
  appName?: string;
  appIcon?: string | null;
  sortOrder?: number;
};

export const createMonitoredAppRequestSchema = {
  packageName: {
    type: 'string',
    required: true,
    minLength: 1
  },
  appName: {
    type: 'string',
    required: true,
    minLength: 1
  },
  appIcon: {
    type: 'string'
  },
  sortOrder: {
    type: 'number'
  }
} as const;

export const updateMonitoredAppRequestSchema = {
  packageName: {
    type: 'string',
    minLength: 1
  },
  appName: {
    type: 'string',
    minLength: 1
  },
  appIcon: {
    type: 'string'
  },
  sortOrder: {
    type: 'number'
  }
} as const;
