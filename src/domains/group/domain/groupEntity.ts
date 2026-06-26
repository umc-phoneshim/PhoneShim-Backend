export type CreateGroupPayload = {
  name?: string;
};

export type Group = {
  name: string;
  createdAt: string;
};

export function createGroupEntity(payload: CreateGroupPayload = {}): Group {
  return {
    name: payload.name || '',
    createdAt: new Date().toISOString()
  };
}
