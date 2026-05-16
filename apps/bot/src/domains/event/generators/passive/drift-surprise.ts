import { buildOpEmbed } from '../../../../discord/utils/build-op-embed.js';
import { pickRandom } from '../../engine/rng.js';
import type { PassiveGenerator } from '../../types.js';
import { noProbability } from '../utils.js';

// TODO: brancher l'ia et mettre la PP d'un personnage qui dit ça (priorité navigateur)
const DRIFT_SURPRISE_MESSAGES = [
  "Oh.. mais ce n'est pas l'endroit où on voulait aller..?",
  'Hmm, les courants nous ont emportés ailleurs...',
  "Attends... ce n'est pas la bonne île ?!",
  "Mince, on s'est égaré en chemin.",
] as const;

export const driftSurprise: PassiveGenerator = {
  key: 'driftSurprise',
  isInteractive: false,
  seedScope: 'player',
  // TODO: créer un util callback pour rien compute
  probability: noProbability,
  compute: (_ctx, rng) => {
    const message = pickRandom(rng, DRIFT_SURPRISE_MESSAGES);
    return { effects: [], state: { message } };
  },
  render: (state) => {
    const message = (state.message as string | undefined) ?? DRIFT_SURPRISE_MESSAGES[0];
    return buildOpEmbed('info').setTitle(message);
  },
};
