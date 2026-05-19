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

const IMAGES = ['events/passive/seagull-far.webp', 'events/passive/seagull-flyby.webp'];

export const seagullFlyby: PassiveGenerator = {
  key: 'seagullFlyby',
  isInteractive: false,
  seedScope: 'player',
  conditions: (ctx) => isSea(ctx.zone),
  cooldownBuckets: inBuckets('1d'),
  probability: () => 0.3,
  compute: (_ctx, rng) => {
    const title = pickRandom(rng, TITLES);
    const imageUrl = pickRandom(rng, IMAGES);
    return { effects: [], state: { title, imageUrl } };
  },
  render: (state) =>
    buildOpEmbed('info')
      .setTitle(state.title as string)
      .setImage(buildAssetUrl(state.imageUrl as string)),
};
