import { buildOpEmbed } from '../../../../discord/utils/build-op-embed.js';
import { buildAssetUrl } from '../../../../shared/build-asset-url.js';
import type { PassiveGenerator } from '../../types.js';
import { computeNothing } from '../utils.js';

export const peacefulEastBlue: PassiveGenerator = {
  key: 'passive.peaceful_east_blue',
  isInteractive: false,
  seedScope: 'player',
  conditions: (ctx) => ctx.zone === 'sea_east_blue',
  oneTime: true,
  probability: () => 0.05,

  compute: computeNothing,

  render: () => {
    return buildOpEmbed('info')
      .setTitle("East Blue s'étire sous un ciel paisible. L'équipage profite du paysage.")
      .setImage(buildAssetUrl('events/passive/peaceful-east-blue.webp'));
  },
};
