import type { Command } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/index.js';
import { texts } from '../texts.js';

export const introCommand: Command = {
  name: 'intro',
  requiresSynchronization: false,
  async handler({ guild, message }) {
    await message.reply({
      // TODO: trouver un meilleur texte
      embeds: [
        buildOpEmbed('info')
          .setTitle(texts.introAlreadyStartedTitle[guild.language])
          .setDescription(texts.introAlreadyStartedDescription[guild.language]),
      ],
      components: [],
    });
  },
};
