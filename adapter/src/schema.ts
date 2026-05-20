// Required fields and minimum lengths for write_decision args.
// Any violation is returned as { error, flag: 'schema_validation_failed' }
// to the agent so it can self-correct in the next tool call.

interface DecisionArgs {
  entityType: string;
  entityId?: string;
  department: string;
  recommendation: string;
  reasoning: string;
  data?: object;
}

export class DecisionValidationError extends Error {
  constructor(public readonly fields: string[]) {
    super(`write_decision validation failed: ${fields.join('; ')}`);
    this.name = 'DecisionValidationError';
  }
}

export function validateDecisionArgs(args: Record<string, unknown>): DecisionArgs {
  const errors: string[] = [];

  if (typeof args.entityType !== 'string' || args.entityType.trim() === '') {
    errors.push('entityType: required non-empty string');
  }
  if (typeof args.department !== 'string' || args.department.trim() === '') {
    errors.push('department: required non-empty string');
  }
  if (typeof args.recommendation !== 'string' || args.recommendation.trim() === '') {
    errors.push('recommendation: required non-empty string');
  }
  if (typeof args.reasoning !== 'string' || args.reasoning.trim().length < 20) {
    errors.push('reasoning: required string, minimum 20 characters');
  }

  if (errors.length > 0) {
    throw new DecisionValidationError(errors);
  }

  return args as unknown as DecisionArgs;
}
