import { ValidationError } from '../errors.js';

type GetQueryOptions = {
  emptyMessage?: string;
  minLength?: number;
};

export function getQuery(args: Array<string>, options: GetQueryOptions = {}): string {
  const query = args.join(' ').trim();
  const { emptyMessage = 'Tu dois fournir une recherche.', minLength } = options;

  if (!query) {
    throw new ValidationError(emptyMessage);
  }

  if (minLength !== undefined && query.length < minLength) {
    throw new ValidationError(`Ta recherche doit faire au moins ${minLength} caractères.`);
  }

  return query;
}
