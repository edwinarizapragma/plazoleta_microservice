import { ValidationError } from '@nestjs/common';

export function getErrorMessages(errors: ValidationError[]): string[] {
  const errorMessages: string[] = [];

  for (const error of errors) {
    if (error.constraints) {
      errorMessages.push(...Object.values(error.constraints));
    }

    if (error.children && error.children.length) {
      errorMessages.push(...getErrorMessages(error.children));
    }
  }

  return Array.from(new Set(errorMessages));
}
