import type { Command } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/index.js';
import { translations } from '../translations.js';

export const introCommand: Command = {
  names: { fr: 'intro', en: 'intro' },
  requiresSynchronization: false,
  async handler({ guild, message }) {
    await message.reply({
      // TODO: trouver un meilleur texte
      embeds: [
        buildOpEmbed('info')
          .setTitle(translations.introAlreadyStartedTitle[guild.language])
          .setDescription(translations.introAlreadyStartedDescription[guild.language]),
      ],
      components: [],
    });
  },
};
