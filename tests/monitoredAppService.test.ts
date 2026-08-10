import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createMonitoredApp,
  deleteMonitoredApp,
  getMonitoredAppById,
  getMonitoredApps,
  updateMonitoredApp
} from '../src/domains/monitoredApp/application/monitoredAppService';
import * as monitoredAppRepository from '../src/domains/monitoredApp/infrastructure/monitoredAppRepository';

vi.mock('../src/domains/monitoredApp/infrastructure/monitoredAppRepository', () => ({
  RECORD_NOT_FOUND_ERROR: 'P2025',
  TRANSACTION_CONFLICT_ERROR: 'P2034',
  UNIQUE_CONSTRAINT_ERROR: 'P2002',
  deleteByIdAndUserId: vi.fn(),
  findAllByUserId: vi.fn(),
  findByIdAndUserId: vi.fn(),
  findByPackageNameAndUserId: vi.fn(),
  isPrismaKnownError: vi.fn(),
  saveWithinUserLimit: vi.fn(),
  update: vi.fn()
}));

const deleteByIdAndUserIdMock = vi.mocked(monitoredAppRepository.deleteByIdAndUserId);
const findAllByUserIdMock = vi.mocked(monitoredAppRepository.findAllByUserId);
const findByIdAndUserIdMock = vi.mocked(monitoredAppRepository.findByIdAndUserId);
const findByPackageNameAndUserIdMock = vi.mocked(monitoredAppRepository.findByPackageNameAndUserId);
const isPrismaKnownErrorMock = vi.mocked(monitoredAppRepository.isPrismaKnownError);
const saveWithinUserLimitMock = vi.mocked(monitoredAppRepository.saveWithinUserLimit);
const updateMock = vi.mocked(monitoredAppRepository.update);

const monitoredApp = {
  id: 'app-1',
  userId: 'user-1',
  packageName: 'com.example.app',
  appName: 'Example',
  appIcon: null,
  sortOrder: 0,
  createdAt: new Date('2026-07-16T00:00:00.000Z'),
  updatedAt: new Date('2026-07-16T00:00:00.000Z')
};

describe('monitoredAppService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isPrismaKnownErrorMock.mockReturnValue(false);
  });

  it('creates a monitored app within the user limit', async () => {
    saveWithinUserLimitMock.mockResolvedValueOnce(monitoredApp);

    await expect(
      createMonitoredApp({
        userId: 'user-1',
        packageName: 'com.example.app',
        appName: 'Example'
      })
    ).resolves.toBe(monitoredApp);

    expect(saveWithinUserLimitMock).toHaveBeenCalledWith(
      {
        userId: 'user-1',
        packageName: 'com.example.app',
        appName: 'Example',
        appIcon: null,
        sortOrder: undefined
      },
      5
    );
  });

  it('rejects creating a monitored app when the user limit is reached', async () => {
    saveWithinUserLimitMock.mockResolvedValueOnce(null);

    await expect(
      createMonitoredApp({
        userId: 'user-1',
        packageName: 'com.example.app',
        appName: 'Example'
      })
    ).rejects.toMatchObject({ statusCode: 400, code: 'MONITORED_APP_LIMIT_EXCEEDED' });
  });

  it('retries transaction conflicts during create and then succeeds', async () => {
    const conflict = new Error('conflict');
    saveWithinUserLimitMock.mockRejectedValueOnce(conflict).mockResolvedValueOnce(monitoredApp);
    isPrismaKnownErrorMock.mockImplementation(
      (error, code) => error === conflict && code === 'P2034'
    );

    await expect(
      createMonitoredApp({
        userId: 'user-1',
        packageName: 'com.example.app',
        appName: 'Example'
      })
    ).resolves.toBe(monitoredApp);

    expect(saveWithinUserLimitMock).toHaveBeenCalledTimes(2);
  });

  it('maps a final transaction conflict to a conflict response', async () => {
    const conflict = new Error('conflict');
    saveWithinUserLimitMock.mockRejectedValue(conflict);
    isPrismaKnownErrorMock.mockImplementation(
      (error, code) => error === conflict && code === 'P2034'
    );

    await expect(
      createMonitoredApp({
        userId: 'user-1',
        packageName: 'com.example.app',
        appName: 'Example'
      })
    ).rejects.toMatchObject({ statusCode: 409, code: 'MONITORED_APP_CONFLICT' });

    expect(saveWithinUserLimitMock).toHaveBeenCalledTimes(3);
  });

  it('maps unique constraint errors to already exists', async () => {
    const unique = new Error('unique');
    saveWithinUserLimitMock.mockRejectedValueOnce(unique);
    isPrismaKnownErrorMock.mockImplementation(
      (error, code) => error === unique && code === 'P2002'
    );

    await expect(
      createMonitoredApp({
        userId: 'user-1',
        packageName: 'com.example.app',
        appName: 'Example'
      })
    ).rejects.toMatchObject({ statusCode: 409, code: 'MONITORED_APP_ALREADY_EXISTS' });
  });

  it('gets monitored apps after validating user id', async () => {
    findAllByUserIdMock.mockResolvedValueOnce([monitoredApp]);

    await expect(getMonitoredApps('user-1')).resolves.toEqual([monitoredApp]);
  });

  it('rejects a blank user id when listing monitored apps', async () => {
    await expect(getMonitoredApps(' ')).rejects.toMatchObject({
      statusCode: 400,
      code: 'VALIDATION_ERROR'
    });
  });

  it('rejects getting a missing monitored app', async () => {
    findByIdAndUserIdMock.mockResolvedValueOnce(null);

    await expect(getMonitoredAppById('app-1', 'user-1')).rejects.toMatchObject({
      statusCode: 404,
      code: 'MONITORED_APP_NOT_FOUND'
    });
  });

  it('rejects updating to a package name already used by another app', async () => {
    findByIdAndUserIdMock.mockResolvedValueOnce(monitoredApp);
    findByPackageNameAndUserIdMock.mockResolvedValueOnce({ ...monitoredApp, id: 'app-2' });

    await expect(
      updateMonitoredApp('app-1', 'user-1', { packageName: 'com.example.other' })
    ).rejects.toMatchObject({ statusCode: 409, code: 'MONITORED_APP_ALREADY_EXISTS' });

    expect(updateMock).not.toHaveBeenCalled();
  });

  it('updates a monitored app when package name uniqueness passes', async () => {
    findByIdAndUserIdMock.mockResolvedValueOnce(monitoredApp);
    findByPackageNameAndUserIdMock.mockResolvedValueOnce(null);
    updateMock.mockResolvedValueOnce({ ...monitoredApp, appName: 'Updated' });

    await updateMonitoredApp('app-1', 'user-1', {
      packageName: 'com.example.other',
      appName: 'Updated'
    });

    expect(updateMock).toHaveBeenCalledWith('app-1', 'user-1', {
      packageName: 'com.example.other',
      appName: 'Updated'
    });
  });

  it('maps record not found errors while deleting', async () => {
    const notFound = new Error('not found');
    findByIdAndUserIdMock.mockResolvedValueOnce(monitoredApp);
    deleteByIdAndUserIdMock.mockRejectedValueOnce(notFound);
    isPrismaKnownErrorMock.mockImplementation(
      (error, code) => error === notFound && code === 'P2025'
    );

    await expect(deleteMonitoredApp('app-1', 'user-1')).rejects.toMatchObject({
      statusCode: 404,
      code: 'MONITORED_APP_NOT_FOUND'
    });
  });
});
