import { describe, expect, it } from 'vitest';

import {
  createTotalGoalEntity,
  createTotalGoalUpdate
} from '../src/domains/totalGoal/domain/totalGoalEntity';

describe('createTotalGoalEntity', () => {
  it('creates a total goal with default restrictAfter', () => {
    expect(createTotalGoalEntity('user-1', { targetMinutes: 10 })).toEqual({
      userId: 'user-1',
      targetMinutes: 10,
      restrictAfter: false
    });
  });

  it('keeps an explicit restrictAfter value', () => {
    expect(createTotalGoalEntity('user-1', { targetMinutes: 1430, restrictAfter: true })).toEqual({
      userId: 'user-1',
      targetMinutes: 1430,
      restrictAfter: true
    });
  });

  it('rejects target minutes below the minimum', () => {
    expect(() => createTotalGoalEntity('user-1', { targetMinutes: 9 })).toThrow(
      'targetMinutes must be an integer between 10 and 1430'
    );
  });

  it('rejects non-integer target minutes', () => {
    expect(() => createTotalGoalEntity('user-1', { targetMinutes: 10.5 })).toThrow(
      'targetMinutes must be an integer between 10 and 1430'
    );
  });
});

describe('createTotalGoalUpdate', () => {
  it('validates provided fields', () => {
    expect(createTotalGoalUpdate({ targetMinutes: 60, restrictAfter: true })).toEqual({
      targetMinutes: 60,
      restrictAfter: true
    });
  });

  it('rejects an empty update', () => {
    expect(() => createTotalGoalUpdate({})).toThrow('At least one field is required');
  });
});
