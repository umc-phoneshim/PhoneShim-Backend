import type { Group } from './groupEntity';

export default interface GroupRepositoryInterface {
  save(group: Group): Promise<Group & { id: string | number | null }>;
  findAll(): Promise<Group[]>;
}
