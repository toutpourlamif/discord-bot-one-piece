import { buildOpEmbed } from '../../../../discord/utils/build-op-embed.js';
import { buildAssetUrl } from '../../../../shared/build-asset-url.js';
import { isSea } from '../../../navigation/utils/index.js';
import { inBuckets } from '../../engine/bucket.js';
import type { PassiveGenerator } from '../../types.js';
import { noCompute } from '../utils.js';

export const seagullFlyby: PassiveGenerator = {
  key: 'seagullFlyby',
  isInteractive: false,
  seedScope: 'player',
  conditions: (ctx) => isSea(ctx.zone),
  cooldownBuckets: inBuckets('1d'),
  probability: () => 0.3,

  compute: noCompute,

  render: () => {
    return buildOpEmbed('info').setTitle('Une mouette a survolé le navire.').setImage(buildAssetUrl('events/passive/seagull-flyby.webp'));
  },
};
