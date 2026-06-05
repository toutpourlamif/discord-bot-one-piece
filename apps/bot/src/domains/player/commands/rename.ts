import type { Command } from '../../../discord/types.js';
import { buildOpEmbed, getQuery } from '../../../discord/utils/index.js';
import { renamePlayer } from '../service.js';
import { texts } from '../texts.js';

export const renameCommand: Command = {
  name: 'rename',
  async handler({ message, args, guild, player }) {
    const name = getQuery(args, { emptyMessage: texts.renameMissingName[guild.language] });
    const renamed = await renamePlayer(player.id, name);

    const embed = buildOpEmbed('success')
      .setTitle(texts.renameSuccessTitle[guild.language])
      .setDescription(texts.renameSuccessDescription[guild.language](renamed.name));
    await message.reply({ embeds: [embed] });
  },
};
