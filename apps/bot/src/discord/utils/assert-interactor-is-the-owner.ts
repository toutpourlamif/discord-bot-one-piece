import type { ButtonInteraction } from 'discord.js';

import { ForbiddenError } from '../errors.js';

export function assertInteractorIsTheOwner(interaction: ButtonInteraction, ownerDiscordId: string): void {
  if (interaction.user.id !== ownerDiscordId) {
    throw new ForbiddenError("Cette action ne t'est pas destinée.");
  }
}
