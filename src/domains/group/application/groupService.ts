import { createGroupEntity, type CreateGroupPayload } from '../domain/groupEntity';
import * as groupRepository from '../infrastructure/groupRepository';

export async function listGroups() {
  return groupRepository.findAll();
}

export async function createGroup(payload: CreateGroupPayload) {
  const group = createGroupEntity(payload);

  return groupRepository.save(group);
}
