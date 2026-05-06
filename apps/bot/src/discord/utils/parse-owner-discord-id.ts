import { ValidationError } from '../errors.js';

export function parseOwnerDiscordId(ownerDiscordId: string | undefined): string {
  if (!ownerDiscordId) {
    throw new ValidationError("Propriétaire de l'action introuvable.");
  }

  return ownerDiscordId;
}
