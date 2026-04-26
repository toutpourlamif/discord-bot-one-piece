import type { Command } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/build-op-embed.js';
import { getTargetUser } from '../../../discord/utils/get-target-user.js';
import { findOrCreatePlayer } from '../../player/service.js';
import { runFishingAttempt } from '../service.js';

export const fishingCommand: Command = {
  // TODO: !fish devrait marcher aussi, il faut retravailler l'architecture pour que name soit une liste de strings
  // https://github.com/toutpourlamif/discord-bot-one-piece/issues/118
  name: 'fish',
  async handler(message) {
    const user = getTargetUser(message);
    const { player } = await findOrCreatePlayer(user.id, user.username);
    const result = await runFishingAttempt(player.id);

    const embed = buildOpEmbed()
      .setTitle('🎣 Pêche')
      .setDescription(`${player.name} a pêché ${result.quantity}x **${result.resourceName}** !`);
    await message.reply({ embeds: [embed] });
  },
};
