import type { ButtonInteraction } from 'discord.js';

import { ValidationError } from '../errors.js';

export function assertMenuOwner(interaction: ButtonInteraction, ownerDiscordId: string | undefined): string {
  if (!ownerDiscordId) throw new ValidationError('Propriétaire du menu introuvable.');
  if (interaction.user.id === ownerDiscordId) return ownerDiscordId;

  throw new ValidationError("Ce menu n'est pas pour toi.");
}
