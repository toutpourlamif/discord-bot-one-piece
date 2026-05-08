import { buildOpEmbed } from '../../../../discord/utils/build-op-embed.js';
import { buildAssetUrl } from '../../../../shared/build-asset-url.js';
import type { PassiveGenerator } from '../../types.js';
import { computeNothing } from '../utils.js';

export const seagullFlyby: PassiveGenerator = {
  key: 'passive.seagull_flyby',
  isInteractive: false,
  seedScope: 'player',
  conditions: (ctx) => ctx.zone === 'sea_east_blue',
  cooldownBuckets: 2,
  probability: () => 0.3,

  compute: computeNothing,

  render: () => {
    return buildOpEmbed('info')
      .setTitle('Une mouette passe au-dessus du navire.')
      .setImage(buildAssetUrl('events/passive/seagull-flyby.webp'));
  },
};
