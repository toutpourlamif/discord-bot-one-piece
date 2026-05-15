import { buildOpEmbed } from '../../../../discord/utils/build-op-embed.js';
import { inBuckets } from '../../engine/bucket.js';
import type { PassiveGenerator } from '../../types.js';
import { computeNothing, isSea } from '../utils.js';

export const roughSea: PassiveGenerator = {
  key: 'roughSea',
  isInteractive: false,
  seedScope: 'zone',
  conditions: (ctx) => isSea(ctx.zone),
  cooldownBuckets: inBuckets('1d'),
  probability: () => 0.15,

  // TODO: appliquer -1 moral via un effet `addMorale` quand morale est implémenté
  compute: computeNothing,

  render: () => {
    return buildOpEmbed('info').setTitle('Une vague secoue le navire (-1 moral).');
  },
};
