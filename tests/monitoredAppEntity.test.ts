import { describe, expect, it } from 'vitest';

import {
  createMonitoredAppEntity,
  createMonitoredAppUpdate
} from '../src/domains/monitoredApp/domain/monitoredAppEntity';

describe('createMonitoredAppEntity', () => {
  it('creates a monitored app with normalized string fields', () => {
    expect(
      createMonitoredAppEntity({
        userId: ' user-1 ',
        packageName: ' com.example.app ',
        appName: ' Example ',
        appIcon: '  icon.png  ',
        sortOrder: 0
      })
    ).toEqual({
      userId: 'user-1',
      packageName: 'com.example.app',
      appName: 'Example',
      appIcon: 'icon.png',
      sortOrder: 0
    });
  });

  it('normalizes blank appIcon to null', () => {
    expect(
      createMonitoredAppEntity({
        userId: 'user-1',
        packageName: 'com.example.app',
        appName: 'Example',
        appIcon: '   '
      }).appIcon
    ).toBeNull();
  });

  it('rejects blank required strings', () => {
    expect(() =>
      createMonitoredAppEntity({
        userId: 'user-1',
        packageName: ' ',
        appName: 'Example'
      })
    ).toThrow('packageName is required');
  });

  it('rejects invalid sortOrder values', () => {
    expect(() =>
      createMonitoredAppEntity({
        userId: 'user-1',
        packageName: 'com.example.app',
        appName: 'Example',
        sortOrder: -1
      })
    ).toThrow('sortOrder must be a non-negative integer');

    expect(() =>
      createMonitoredAppEntity({
        userId: 'user-1',
        packageName: 'com.example.app',
        appName: 'Example',
        sortOrder: 1.5
      })
    ).toThrow('sortOrder must be a non-negative integer');
  });
});

describe('createMonitoredAppUpdate', () => {
  it('validates only provided fields', () => {
    expect(
      createMonitoredAppUpdate({
        appName: '  New Name  ',
        appIcon: '   ',
        sortOrder: 2
      })
    ).toEqual({
      appName: 'New Name',
      appIcon: null,
      sortOrder: 2
    });
  });

  it('rejects a blank provided package name', () => {
    expect(() => createMonitoredAppUpdate({ packageName: '  ' })).toThrow(
      'packageName is required'
    );
  });
});
