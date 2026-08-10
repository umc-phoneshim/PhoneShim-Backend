export type CreateReminderRequest = {
  date: string;
  title: string;
  startTime: string;
  endTime: string;
  restrictMode?: string;
  restrictedAppIds?: string[];
};

export type UpdateReminderRequest = {
  date?: string;
  title?: string;
  startTime?: string;
  endTime?: string;
  restrictMode?: string;
  restrictedAppIds?: string[];
};

export const createReminderRequestSchema = {
  date: {
    type: 'string',
    required: true,
    minLength: 1
  },
  title: {
    type: 'string',
    required: true,
    minLength: 1
  },
  startTime: {
    type: 'string',
    required: true,
    minLength: 1
  },
  endTime: {
    type: 'string',
    required: true,
    minLength: 1
  },
  restrictMode: {
    type: 'string'
  },
  restrictedAppIds: {
    type: 'stringArray'
  }
} as const;

export const updateReminderRequestSchema = {
  date: {
    type: 'string',
    minLength: 1
  },
  title: {
    type: 'string',
    minLength: 1
  },
  startTime: {
    type: 'string',
    minLength: 1
  },
  endTime: {
    type: 'string',
    minLength: 1
  },
  restrictMode: {
    type: 'string'
  },
  restrictedAppIds: {
    type: 'stringArray'
  }
} as const;
