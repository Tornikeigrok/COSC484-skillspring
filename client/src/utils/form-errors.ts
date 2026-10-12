import type { ZodError } from 'zod';

export type FieldErrors = Record<string, string>;

export function toFieldErrors(error: ZodError): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0]);
    if (!(key in errors)) errors[key] = issue.message;
  }
  return errors;
}

export function withoutError(errors: FieldErrors, target: EventTarget): FieldErrors {
  const name = (target as HTMLInputElement).name;
  if (!(name in errors)) return errors;
  const { [name]: _removed, ...rest } = errors;
  return rest;
}
