export type CreateGroupRequest = {
  name: string;
};

export type GroupResponse = {
  id: string | null;
  name: string;
  createdAt: string;
};

export const createGroupRequestSchema = {
  name: {
    type: 'string',
    required: true,
    minLength: 1
  }
} as const;
