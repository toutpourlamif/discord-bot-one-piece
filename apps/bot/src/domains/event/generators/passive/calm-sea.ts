import { buildOpEmbed } from '../../../../discord/utils/build-op-embed.js';
import { isSea } from '../../../navigation/utils/index.js';
import type { PassiveGenerator } from '../../types.js';
import { computeNothing } from '../utils.js';

export const calmSea: PassiveGenerator = {
  key: 'calmSea',
  isInteractive: false,
  seedScope: 'zone',
  conditions: (ctx) => isSea(ctx.zone),
  cooldownBuckets: 4,
  probability: () => 0.15,

  // TODO: appliquer +1 moral via un effet `addMorale` quand morale est implémenté
  compute: computeNothing,

  render: () => {
    return buildOpEmbed('info').setTitle("La mer est calme aujourd'hui. L'équipage se détend (+1 moral).");
  },
};
