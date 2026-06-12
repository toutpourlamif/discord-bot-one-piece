import { buildOpEmbed } from '../../../../discord/utils/build-op-embed.js';
import { inBuckets } from '../../engine/bucket.js';
import type { GeneratorContext, InteractiveGenerator, Resolution, Rng } from '../../types.js';
import { getRandomIntBetween } from '../utils.js';

export const barrelFound: InteractiveGenerator = {
  key: 'barrelFound',
  isInteractive: true,
  cooldownBuckets: inBuckets('3d'),
  probability: () => 0.01,

  initialStep: 'openOrLeave',
  steps: {
    openOrLeave: {
      embed: () => buildOpEmbed('info').setTitle('Votre équipage a croisé un baril qui flottait.'),
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
    embed: buildOpEmbed('success').setTitle(`Vous avez trouvé ${berries} berries dans le baril.`),
    effects: [{ type: 'addBerries', amount: BigInt(berries) }],
    resolutionType: 'barrelFound.opened',
  };
}

function leaveBarrel(): Resolution {
  return {
    embed: buildOpEmbed('info').setTitle('Vous avez passé votre chemin.'),
    effects: [],
    resolutionType: 'barrelFound.left',
  };
}
