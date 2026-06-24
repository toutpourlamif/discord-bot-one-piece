import { ValidationError } from '../../../discord/errors.js';
import type { Command } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/index.js';
import { getCrewDisplayName } from '../../crew/index.js';
import { resolveTargetPlayer } from '../../player/index.js';
import * as shipService from '../../ship/service.js';
import { SHIP_TEMPLATES, isShipTemplateKey } from '../../ship/templates.js';

export const setShipTemplateCommand: Command = {
  names: { fr: 'set-ship', en: 'set-ship' },
  aliases: { fr: ['ss'], en: ['ss'] },
  async handler(ctx) {
    const { targetPlayer, rest } = await resolveTargetPlayer(ctx);
    const shipKey = rest[0];

    if (!shipKey || !isShipTemplateKey(shipKey)) {
      const available = Object.keys(SHIP_TEMPLATES).join(', ');
      throw new ValidationError(`Template inconnu. Disponibles : \`${available}\`.`);
    }

    const updatedShip = await shipService.switchShipTemplate(targetPlayer.id, shipKey);

    // TODO: utiliser wrapInBackticks autour de `shipKey` quand l'util sera dispo
    await ctx.message.reply({
      embeds: [
        buildOpEmbed('success').setDescription(
          `${getCrewDisplayName(targetPlayer)} navigue désormais sur **${updatedShip.name}** (\`${shipKey}\`).`,
        ),
      ],
    });
  },
};
