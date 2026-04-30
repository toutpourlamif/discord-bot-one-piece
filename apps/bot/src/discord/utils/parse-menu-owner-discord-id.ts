import { ValidationError } from '../errors.js';

export function parseMenuOwnerDiscordId(ownerDiscordId: string | undefined): string {
  if (!ownerDiscordId) {
    throw new ValidationError('Propriétaire du menu introuvable.');
  }

  return ownerDiscordId;
}
