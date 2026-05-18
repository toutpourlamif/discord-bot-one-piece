import { buildOpEmbed } from '../../../../discord/utils/build-op-embed.js';
import { buildAssetUrl } from '../../../../shared/build-asset-url.js';
import { isSea } from '../../../navigation/utils/index.js';
import { inBuckets } from '../../engine/bucket.js';
import type { PassiveGenerator } from '../../types.js';
import { getRandomIntBetween } from '../utils.js';

const TITLES = [
  "Le cri d'une mouette se fait entendre pas loin du navire...",
  'Une mouette a survolé le navire.',
  'Plusieurs mouettes chassent des poissons près du bâteau.',
  'Vous voyez une mouette sur le mas.',
] as const;

const IMAGES = ['events/passive/seagull-flyby-logo.webp', 'events/passive/seagull-flyby.webp'];

export const seagullFlyby: PassiveGenerator = {
  key: 'seagullFlyby',
  isInteractive: false,
  seedScope: 'player',
  conditions: (ctx) => isSea(ctx.zone),
  cooldownBuckets: inBuckets('1d'),
  probability: () => 0.3,
  compute: (_ctx, rng) => {
    const titleIdx = getRandomIntBetween(rng, 0, TITLES.length - 1);
    const imageIdx = getRandomIntBetween(rng, 0, IMAGES.length - 1);
    return { effects: [], state: { titleIdx, imageIdx } };
  },
  render: (state) =>
    buildOpEmbed('info')
      .setTitle(TITLES[state.titleIdx as number]!)
      .setImage(buildAssetUrl(IMAGES[state.imageIdx as number]!)),
};
