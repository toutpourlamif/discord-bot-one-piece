import type { Command } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/index.js';
import { resolveTargetPlayer } from '../../player/index.js';
import * as shipService from '../../ship/service.js';
import { SHIP_TEMPLATES, isShipTemplateKey } from '../../ship/templates.js';

export const setShipTemplateCommand: Command = {
  name: ['set-ship', 'setship'],
  async handler(ctx) {
    const { targetPlayer, rest } = await resolveTargetPlayer(ctx);
    const key = rest[0];

    if (!key || !isShipTemplateKey(key)) {
      const available = Object.keys(SHIP_TEMPLATES).join(', ');
      await ctx.message.reply({ embeds: [buildOpEmbed().setDescription(`Template inconnu. Disponibles : \`${available}\`.`)] });
      return;
    }

    const updated = await shipService.switchShipTemplate(targetPlayer.id, key);

    await ctx.message.reply({
      embeds: [buildOpEmbed().setDescription(`${targetPlayer.name} navigue désormais sur **${updated.name}** (\`${key}\`).`)],
    });
  },
};
