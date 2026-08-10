import { Prisma } from '@prisma/client';

export const PRISMA_UNIQUE_CONSTRAINT_ERROR = 'P2002';
export const PRISMA_RECORD_NOT_FOUND_ERROR = 'P2025';
export const PRISMA_TRANSACTION_CONFLICT_ERROR = 'P2034';

export function isPrismaKnownError(error: unknown, code: string): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === code;
}
