import { buildOpEmbed } from '../../../../discord/utils/build-op-embed.js';
import { buildAssetUrl } from '../../../../shared/build-asset-url.js';
import { isSea } from '../../../navigation/utils/index.js';
import { inBuckets } from '../../engine/bucket.js';
import { pickRandom } from '../../engine/rng.js';
import type { PassiveGenerator } from '../../types.js';

const TITLES = [
  "Le cri d'une mouette s'était fait entendre pas loin du navire...",
  'Une mouette avait survolée le navire.',
  'Plusieurs mouettes chassaient des poissons près du bâteau.',
  'Vous aviez aperçu une mouette sur le mât.',
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
    const titleIdx = pickRandom(rng, TITLES);
    const imageIdx = pickRandom(rng, IMAGES);
    return { effects: [], state: { titleIdx, imageIdx } };
  },
  render: (state) =>
    buildOpEmbed('info')
      .setTitle(TITLES[state.titleIdx as number]!)
      .setImage(buildAssetUrl(IMAGES[state.imageIdx as number]!)),
};
