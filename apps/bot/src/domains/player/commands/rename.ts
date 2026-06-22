import type { Command } from '../../../discord/types.js';
import { buildOpEmbed, getQuery } from '../../../discord/utils/index.js';
import { renamePlayer } from '../service.js';
import { translations } from '../translations.js';

export const renameCommand: Command = {
  names: { fr: 'renommer', en: 'rename' },
  async handler({ message, args, guild, player }) {
    const name = getQuery(args, { emptyMessage: translations.renameMissingName[guild.language] });
    const renamed = await renamePlayer(player.id, name);

    const embed = buildOpEmbed('success')
      .setTitle(translations.renameSuccessTitle[guild.language])
      .setDescription(translations.renameSuccessDescription[guild.language](renamed.name));
    await message.reply({ embeds: [embed] });
  },
};
