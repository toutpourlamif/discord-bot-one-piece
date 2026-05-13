import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

import { AppError } from '../../discord/errors.js';
import { buildCustomId } from '../../discord/utils/build-custom-id.js';
import { buildOpEmbed } from '../../discord/utils/build-op-embed.js';

export class OutOfSyncError extends AppError {
  constructor(ownerDiscordId: string) {
    super('Joueur non synchronisé.', 'warn', 'Joueur non synchronisé.', {
      embeds: [buildOpEmbed('warn').setDescription("Tu as un événement en attente. Vis-le avant d'agir.")],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId(buildCustomId('recap-shortcut', ownerDiscordId))
            .setLabel('Voir mes events')
            .setStyle(ButtonStyle.Primary),
        ),
      ],
    });
    this.name = 'OutOfSyncError';
  }
}
