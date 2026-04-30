import { ValidationError } from '../errors.js';

export function getQuery(args: Array<string>, emptyMessage = 'Tu dois fournir une recherche.'): string {
  const query = args.join(' ');

  if (!query) {
    throw new ValidationError(emptyMessage);
  }

  return query;
}
