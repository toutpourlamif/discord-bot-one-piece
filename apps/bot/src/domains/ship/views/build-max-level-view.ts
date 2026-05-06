import type { ShipModuleKey } from '@one-piece/db';

import type { View } from '../../../discord/types.js';
import { buildBackAction, buildCustomId, buildOpEmbed } from '../../../discord/utils/index.js';
import { UPGRADE_SHIP_BUTTON_NAME } from '../constants.js';
import { SHIP_MODULE_LABELS } from '../modules.js';

export function buildMaxLevelView(playerId: number, ownerDiscordId: string, moduleKey: ShipModuleKey): View {
  return {
    embeds: [
      buildOpEmbed('warn')
        .setTitle(`${SHIP_MODULE_LABELS[moduleKey]} — niveau maximum`)
        .setDescription('Ce module est déjà au niveau maximum.'),
    ],
    components: [buildBackAction(buildCustomId(UPGRADE_SHIP_BUTTON_NAME, ownerDiscordId, playerId))],
  };
}
