import { afterEach, describe, expect, it, vi } from 'vitest';

import { createGroupEntity } from '../src/domains/group/domain/groupEntity';

describe('createGroupEntity', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates a group with the current timestamp', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-16T01:02:03.000Z'));

    expect(createGroupEntity({ name: 'study' })).toEqual({
      name: 'study',
      createdAt: '2026-07-16T01:02:03.000Z'
    });
  });
});
