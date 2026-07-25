import { describe, expect, it } from 'vitest';

import {
  createAppGoalEntity,
  createAppGoalUpdate
} from '../src/domains/appGoal/domain/appGoalEntity';

describe('createAppGoalEntity', () => {
  it('creates a valid app goal entity with defaults and normalized reason', () => {
    const appGoal = createAppGoalEntity({
      monitoredAppId: 'app-1',
      targetMinutes: 10,
      targetCount: 1,
      goalReason: '  focus  '
    });

    expect(appGoal).toEqual({
      monitoredAppId: 'app-1',
      targetMinutes: 10,
      targetCount: 1,
      restrictAfter: false,
      goalReason: 'focus'
    });
  });

  it('allows target minutes at the maximum boundary', () => {
    expect(
      createAppGoalEntity({
        monitoredAppId: 'app-1',
        targetMinutes: 1430,
        targetCount: 1
      }).targetMinutes
    ).toBe(1430);
  });

  it('rejects target minutes outside the allowed range', () => {
    expect(() =>
      createAppGoalEntity({
        monitoredAppId: 'app-1',
        targetMinutes: 9,
        targetCount: 1
      })
    ).toThrow('targetMinutes must be an integer between 10 and 1430');
  });

  it('rejects a non-integer target count', () => {
    expect(() =>
      createAppGoalEntity({
        monitoredAppId: 'app-1',
        targetMinutes: 10,
        targetCount: 1.5
      })
    ).toThrow('targetCount must be an integer of 1 or more');
  });

  it('rejects a blank monitored app id', () => {
    expect(() =>
      createAppGoalEntity({
        monitoredAppId: '   ',
        targetMinutes: 10,
        targetCount: 1
      })
    ).toThrow('monitoredAppId is required');
  });

  it('normalizes a blank goal reason to null', () => {
    expect(
      createAppGoalEntity({
        monitoredAppId: 'app-1',
        targetMinutes: 10,
        targetCount: 1,
        goalReason: '   '
      }).goalReason
    ).toBeNull();
  });

  it('rejects a goal reason longer than 100 characters', () => {
    expect(() =>
      createAppGoalEntity({
        monitoredAppId: 'app-1',
        targetMinutes: 10,
        targetCount: 1,
        goalReason: '가'.repeat(101)
      })
    ).toThrow('goalReason must be at most 100 characters');
  });
});

describe('createAppGoalUpdate', () => {
  it('validates only provided update fields', () => {
    expect(
      createAppGoalUpdate({
        targetMinutes: 30,
        restrictAfter: true,
        goalReason: '  study  '
      })
    ).toEqual({
      targetMinutes: 30,
      restrictAfter: true,
      goalReason: 'study'
    });
  });

  it('rejects invalid provided update fields', () => {
    expect(() => createAppGoalUpdate({ targetCount: 0 })).toThrow(
      'targetCount must be an integer of 1 or more'
    );
  });
});
