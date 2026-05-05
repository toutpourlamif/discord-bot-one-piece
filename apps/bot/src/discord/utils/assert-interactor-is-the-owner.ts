import type { ButtonInteraction } from 'discord.js';

import { ValidationError } from '../errors.js';

export function assertInteractorIsTheOwner(interaction: ButtonInteraction, ownerDiscordId: string): void {
  if (interaction.user.id !== ownerDiscordId) {
    throw new ValidationError("Cette action ne t'est pas destinée.");
  }
}
