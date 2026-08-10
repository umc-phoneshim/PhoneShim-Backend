import { Prisma } from '@prisma/client';
import { describe, expect, it } from 'vitest';

import {
  isPrismaKnownError,
  PRISMA_RECORD_NOT_FOUND_ERROR,
  PRISMA_TRANSACTION_CONFLICT_ERROR,
  PRISMA_UNIQUE_CONSTRAINT_ERROR
} from '../src/shared/errors/prismaError';

const prismaError = (code: string) =>
  new Prisma.PrismaClientKnownRequestError('Prisma error', {
    clientVersion: 'test',
    code
  });

describe('isPrismaKnownError', () => {
  it('matches a Prisma error with the given code', () => {
    expect(
      isPrismaKnownError(
        prismaError(PRISMA_UNIQUE_CONSTRAINT_ERROR),
        PRISMA_UNIQUE_CONSTRAINT_ERROR
      )
    ).toBe(true);
    expect(
      isPrismaKnownError(prismaError(PRISMA_RECORD_NOT_FOUND_ERROR), PRISMA_RECORD_NOT_FOUND_ERROR)
    ).toBe(true);
    expect(
      isPrismaKnownError(
        prismaError(PRISMA_TRANSACTION_CONFLICT_ERROR),
        PRISMA_TRANSACTION_CONFLICT_ERROR
      )
    ).toBe(true);
  });

  it('rejects a Prisma error with a different code', () => {
    expect(
      isPrismaKnownError(prismaError(PRISMA_UNIQUE_CONSTRAINT_ERROR), PRISMA_RECORD_NOT_FOUND_ERROR)
    ).toBe(false);
  });

  it('rejects a non-Prisma error', () => {
    expect(isPrismaKnownError(new Error('plain error'), PRISMA_UNIQUE_CONSTRAINT_ERROR)).toBe(
      false
    );
    expect(isPrismaKnownError(undefined, PRISMA_UNIQUE_CONSTRAINT_ERROR)).toBe(false);
  });
});
