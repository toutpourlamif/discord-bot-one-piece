import { buildOpEmbed } from '../../../../discord/utils/build-op-embed.js';
import { inBuckets } from '../../engine/bucket.js';
import type { GeneratorContext, InteractiveGenerator, Resolution, Rng } from '../../types.js';
import { getRandomIntBetween } from '../utils.js';

export const barrelFound: InteractiveGenerator = {
  key: 'fishing.barrel_found',
  isInteractive: true,
  seedScope: 'player',
  cooldownBuckets: inBuckets('3d'),
  probability: () => 0.1,

  initialStep: 'openOrLeave',
  steps: {
    openOrLeave: {
      embed: () => buildOpEmbed('info').setTitle('Un baril flotte près du navire.'),
      choices: () => [
        { id: 'open', label: 'Ouvrir', resolve: openBarrel },
        { id: 'leave', label: 'Laisser', resolve: leaveBarrel },
      ],
    },
  },
};

function openBarrel(_ctx: GeneratorContext, rng: Rng): Resolution {
  const berries = getRandomIntBetween(rng, 100, 1000);
  return {
    embed: buildOpEmbed('success').setTitle(`Tu trouves ${berries} berries dans le baril.`),
    effects: [{ type: 'addBerries', amount: BigInt(berries) }],
    resolutionType: 'fishing.barrel_found.opened',
  };
}

function leaveBarrel(): Resolution {
  return {
    embed: buildOpEmbed('info').setTitle('Tu passes ton chemin.'),
    effects: [],
    resolutionType: 'fishing.barrel_found.left',
  };
}
