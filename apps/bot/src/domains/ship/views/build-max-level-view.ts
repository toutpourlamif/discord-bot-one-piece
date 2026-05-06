import type { ShipModuleKey } from '@one-piece/db';

import type { View } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/index.js';
import { SHIP_MODULE_LABELS } from '../modules.js';

import { buildBackAction } from './build-back-action.js';

export function buildMaxLevelView(playerId: number, ownerDiscordId: string, moduleKey: ShipModuleKey): View {
  return {
    embeds: [
      buildOpEmbed('warn')
        .setTitle(`${SHIP_MODULE_LABELS[moduleKey]} — niveau maximum`)
        .setDescription('Ce module est déjà au niveau maximum.'),
    ],
    components: [buildBackAction(playerId, ownerDiscordId)],
  };
}
