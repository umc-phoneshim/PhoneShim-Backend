import type { RequestHandler } from 'express';

import { BadRequestError } from '../errors/appError';

type FieldType = 'string' | 'number';

type FieldRule = {
  type: FieldType;
  required?: boolean;
  minLength?: number;
};

type ValidationSchema = Record<string, FieldRule>;

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const isValidType = (value: unknown, type: FieldType): boolean => {
  if (type === 'string') {
    return typeof value === 'string';
  }

  return typeof value === 'number' && Number.isFinite(value);
};

export const validateRequestBody = (schema: ValidationSchema): RequestHandler => {
  return (req, _res, next) => {
    if (!isPlainObject(req.body)) {
      next(new BadRequestError('Request body must be a JSON object', 'INVALID_REQUEST_BODY'));
      return;
    }

    for (const [fieldName, rule] of Object.entries(schema)) {
      const value = req.body[fieldName];

      if (value === undefined || value === null) {
        if (rule.required) {
          next(new BadRequestError(`${fieldName} is required`, 'VALIDATION_ERROR'));
          return;
        }

        continue;
      }

      if (!isValidType(value, rule.type)) {
        next(new BadRequestError(`${fieldName} must be a ${rule.type}`, 'VALIDATION_ERROR'));
        return;
      }

      if (
        rule.type === 'string' &&
        typeof value === 'string' &&
        rule.minLength &&
        value.trim().length < rule.minLength
      ) {
        next(
          new BadRequestError(
            `${fieldName} must be at least ${rule.minLength} characters`,
            'VALIDATION_ERROR'
          )
        );
        return;
      }
    }

    next();
  };
};
