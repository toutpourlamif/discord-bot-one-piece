import { buildOpEmbed } from '../../../../discord/utils/build-op-embed.js';
import { isSea } from '../../../navigation/utils/index.js';
import type { PassiveGenerator } from '../../types.js';
import { computeNothing } from '../utils.js';

export const roughSea: PassiveGenerator = {
  key: 'roughSea',
  isInteractive: false,
  seedScope: 'zone',
  conditions: (ctx) => isSea(ctx.zone),
  cooldownBuckets: 4,
  probability: () => 0.15,

  // TODO: appliquer -1 moral via un effet `addMorale` quand morale est implémenté
  compute: computeNothing,

  render: () => {
    return buildOpEmbed('info').setTitle('Une vague secoue le navire (-1 moral).');
  },
};
