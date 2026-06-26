import type { Group } from '../domain/groupEntity';

export async function save(group: Group) {
  return {
    id: null,
    ...group
  };
}

export async function findAll(): Promise<Group[]> {
  return [];
}
