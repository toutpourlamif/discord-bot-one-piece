import type { ButtonInteraction } from 'discord.js';

import { ValidationError } from '../errors.js';

export function parseMenuOwnerDiscordId(ownerDiscordId: string | undefined): string {
  if (!ownerDiscordId) throw new ValidationError('Propriétaire du menu introuvable.');
  return ownerDiscordId;
}

export function assertMenuOwner(interaction: ButtonInteraction, ownerDiscordId: string): void {
  if (interaction.user.id === ownerDiscordId) return;

  throw new ValidationError("Ce menu n'est pas pour toi.");
}
