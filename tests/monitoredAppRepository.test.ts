import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  deleteByIdAndUserId,
  findAllByUserId,
  findByIdAndUserId,
  findByPackageNameAndUserId,
  saveWithinUserLimit,
  update
} from '../src/domains/monitoredApp/infrastructure/monitoredAppRepository';
import prisma from '../src/shared/database/prismaClient';

vi.mock('../src/shared/database/prismaClient', () => ({
  default: {
    $transaction: vi.fn(),
    monitoredApp: {
      delete: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn()
    }
  }
}));

const transactionMock = vi.mocked(prisma.$transaction);
const monitoredAppDeleteMock = vi.mocked(prisma.monitoredApp.delete);
const monitoredAppFindFirstMock = vi.mocked(prisma.monitoredApp.findFirst);
const monitoredAppFindManyMock = vi.mocked(prisma.monitoredApp.findMany);
const monitoredAppFindUniqueMock = vi.mocked(prisma.monitoredApp.findUnique);
const monitoredAppUpdateMock = vi.mocked(prisma.monitoredApp.update);

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

describe('monitoredAppRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('finds all monitored apps ordered for a user', async () => {
    monitoredAppFindManyMock.mockResolvedValueOnce([monitoredApp] as never);

    await expect(findAllByUserId('user-1')).resolves.toEqual([monitoredApp]);
    expect(monitoredAppFindManyMock).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }]
    });
  });

  it('finds a monitored app by id and user id', async () => {
    monitoredAppFindFirstMock.mockResolvedValueOnce(monitoredApp as never);

    await expect(findByIdAndUserId('app-1', 'user-1')).resolves.toEqual(monitoredApp);
    expect(monitoredAppFindFirstMock).toHaveBeenCalledWith({
      where: { id: 'app-1', userId: 'user-1' }
    });
  });

  it('finds a monitored app by package name and user id', async () => {
    monitoredAppFindUniqueMock.mockResolvedValueOnce(monitoredApp as never);

    await expect(findByPackageNameAndUserId('com.example.app', 'user-1')).resolves.toEqual(
      monitoredApp
    );
    expect(monitoredAppFindUniqueMock).toHaveBeenCalledWith({
      where: {
        userId_packageName: {
          userId: 'user-1',
          packageName: 'com.example.app'
        }
      }
    });
  });

  it('saves within user limit using a serializable transaction and default sort order', async () => {
    const countMock = vi.fn().mockResolvedValueOnce(2);
    const createMock = vi.fn().mockResolvedValueOnce({ ...monitoredApp, sortOrder: 2 });
    transactionMock.mockImplementationOnce(async (callback: never) =>
      callback({
        monitoredApp: {
          count: countMock,
          create: createMock
        }
      })
    );

    await expect(
      saveWithinUserLimit(
        {
          userId: 'user-1',
          packageName: 'com.example.app',
          appName: 'Example',
          appIcon: null,
          sortOrder: undefined
        },
        5
      )
    ).resolves.toMatchObject({ sortOrder: 2 });

    expect(countMock).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
    expect(createMock).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        packageName: 'com.example.app',
        appName: 'Example',
        appIcon: null,
        sortOrder: 2
      }
    });
    expect(transactionMock).toHaveBeenCalledWith(expect.any(Function), {
      isolationLevel: 'Serializable'
    });
  });

  it('returns null inside the transaction when the user limit is reached', async () => {
    const countMock = vi.fn().mockResolvedValueOnce(5);
    const createMock = vi.fn();
    transactionMock.mockImplementationOnce(async (callback: never) =>
      callback({
        monitoredApp: {
          count: countMock,
          create: createMock
        }
      })
    );

    await expect(
      saveWithinUserLimit(
        {
          userId: 'user-1',
          packageName: 'com.example.app',
          appName: 'Example',
          appIcon: null
        },
        5
      )
    ).resolves.toBeNull();
    expect(createMock).not.toHaveBeenCalled();
  });

  it('updates and deletes by id and user id', async () => {
    monitoredAppUpdateMock.mockResolvedValueOnce({ ...monitoredApp, appName: 'Updated' } as never);
    monitoredAppDeleteMock.mockResolvedValueOnce(monitoredApp as never);

    await update('app-1', 'user-1', { appName: 'Updated' });
    await deleteByIdAndUserId('app-1', 'user-1');

    expect(monitoredAppUpdateMock).toHaveBeenCalledWith({
      where: { id: 'app-1', userId: 'user-1' },
      data: { appName: 'Updated' }
    });
    expect(monitoredAppDeleteMock).toHaveBeenCalledWith({
      where: { id: 'app-1', userId: 'user-1' }
    });
  });
});
