import { ValidationError } from '../../../discord/errors.js';
import type { Command } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/index.js';
import { getCrewDisplayName } from '../../crew/index.js';
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
      throw new ValidationError(`Template inconnu. Disponibles : \`${available}\`.`);
    }

    const updatedShip = await shipService.switchShipTemplate(targetPlayer.id, key);

    // TODO: utiliser wrapInBackticks autour de `key` quand l'util sera dispo
    await ctx.message.reply({
      embeds: [
        buildOpEmbed('success').setDescription(
          `${getCrewDisplayName(targetPlayer)} navigue désormais sur **${updatedShip.name}** (\`${key}\`).`,
        ),
      ],
    });
  },
};
