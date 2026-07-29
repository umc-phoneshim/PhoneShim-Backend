import { describe, expect, it } from 'vitest';
import { createUserNameMotivUpdate } from '../src/domains/user/domain/userEntity';

describe('createUserNameMotivUpdate', () => {
  it('creates a valid update name and motivation', () => {
    const payload = { name: 'Choi', motivation: '집중하기' };
    const update = createUserNameMotivUpdate(payload);
    expect(update).toMatchObject({
      name: 'Choi',
      motivation: '집중하기'
    });
  });

  it('allows only name to be updated', () => {
    const payload = { name: 'Choi' };
    const update = createUserNameMotivUpdate(payload);
    expect(update).toMatchObject({
      name: 'Choi'
    });
  });

  it('rejects a blank name', () => {
    expect(() => createUserNameMotivUpdate({ name: '   ' })).toThrow('name is required');
  });

  it('allows a motivation with up to 100 characters including spaces', () => {
    const motivation = '가'.repeat(99) + ' ';
    const update = createUserNameMotivUpdate({ motivation });
    expect(update.motivation).toBe(motivation.trim());
  });

  it('rejects a motivation longer than 100 characters', () => {
    expect(() => createUserNameMotivUpdate({ motivation: '가'.repeat(101) })).toThrow(
      'motivation must be no more than 100 characters'
    );
  });

  it('rejects a blank motivation', () => {
    expect(() => createUserNameMotivUpdate({ motivation: '   ' })).toThrow(
      'motivation is required'
    );
  });

  it('rejects an empty payload', () => {
    expect(() => createUserNameMotivUpdate({})).toThrow('At least one field is required');
  });
});
