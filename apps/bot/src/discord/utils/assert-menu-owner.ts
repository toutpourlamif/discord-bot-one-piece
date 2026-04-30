import type { ButtonInteraction } from 'discord.js';

import { ValidationError } from '../errors.js';

export function assertMenuOwner(interaction: ButtonInteraction, ownerDiscordId: string): void {
  if (interaction.user.id !== ownerDiscordId) {
    throw new ValidationError("Ce menu n'est pas pour toi.");
  }
}
