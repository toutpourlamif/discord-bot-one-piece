import { buildOpEmbed } from '../../../../discord/utils/build-op-embed.js';
import { isSea } from '../../../navigation/utils/index.js';
import { inBuckets } from '../../engine/bucket.js';
import type { PassiveGenerator } from '../../types.js';
import { noCompute } from '../utils.js';

export const roughSea: PassiveGenerator = {
  key: 'roughSea',
  isInteractive: false,
  seedScope: 'zone',
  conditions: (ctx) => isSea(ctx.zone),
  cooldownBuckets: inBuckets('1d'),
  probability: () => 0.15,

  // TODO: appliquer -1 moral via un effet `addMorale` quand morale est implémenté
  compute: noCompute,

  render: () => {
    return buildOpEmbed('info').setTitle('Une vague a secoué le navire (-1 moral).');
  },
};
