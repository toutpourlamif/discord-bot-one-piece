import { buildDialogueEmbed, buildOpEmbed, type DialogueSpeaker } from '../../../../discord/utils/index.js';
import type { InteractiveGenerator, Resolution } from '../../types.js';
import { noProbability } from '../utils.js';

// TODO: évènement de test pour valider les dialogue-sheets d'Ace — supprimer une fois les émotions validées.
// Ne se déclenche jamais seul (noProbability) : à lancer via `!fe <@joueur> aceEmotionsTest`.
export const aceEmotionsTest: InteractiveGenerator = {
  key: 'aceEmotionsTest',
  isInteractive: true,
  seedScope: 'player',
  probability: noProbability,

  initialStep: 'intro',
  steps: {
    intro: {
      embed: () =>
        buildDialogueEmbed(ACE, 'Yo ! Portgas D. Ace, commandant de la 2ᵉ flotte de Barbe Blanche. On va tester toutes mes têtes ?'),
      choices: () => [{ id: 'next', label: 'Suivant', goTo: 'happy' }],
    },
    happy: {
      embed: () =>
        buildDialogueEmbed(ACE, "Franchement, naviguer avec l'équipage de Père, c'est la plus belle vie qu'on puisse rêver.", {
          emotion: 'happy',
        }),
      choices: () => [{ id: 'next', label: 'Suivant', goTo: 'laughing' }],
    },
    laughing: {
      embed: () =>
        buildDialogueEmbed(ACE, "Ahah ! Tu connais mon petit frère Luffy ? Cette tête de mule va finir Roi des Pirates, j'te jure !", {
          emotion: 'laughing',
          verb: 'exclaim',
        }),
      choices: () => [{ id: 'next', label: 'Suivant', goTo: 'thinking' }],
    },
    thinking: {
      embed: () =>
        buildDialogueEmbed(ACE, 'Hmm... je traque un type depuis un moment. Teach. Quelque chose chez lui ne tourne pas rond.', {
          emotion: 'thinking',
        }),
      choices: () => [{ id: 'next', label: 'Suivant', goTo: 'angry' }],
    },
    angry: {
      embed: () =>
        buildDialogueEmbed(ACE, 'Insulte Barbe Blanche encore une fois pour voir ! Personne ne touche à ma famille tant que je respire !', {
          emotion: 'angry',
          verb: 'exclaim',
        }),
      choices: () => [{ id: 'next', label: 'Suivant', goTo: 'scared' }],
    },
    scared: {
      embed: () =>
        buildDialogueEmbed(ACE, "Attends... tu as senti ça ? Ce haki... c'est pas normal. On ferait mieux de rester sur nos gardes.", {
          emotion: 'scared',
        }),
      choices: () => [{ id: 'next', label: 'Suivant', goTo: 'crying' }],
    },
    crying: {
      embed: () =>
        buildDialogueEmbed(ACE, "Si un jour je tombe... dis à Luffy que je l'aurai aimé jusqu'au bout. Merci d'être en vie, gamin.", {
          emotion: 'crying',
        }),
      choices: () => [{ id: 'end', label: 'Terminer', resolve: resolveTest }],
    },
  },
};

const ACE: DialogueSpeaker = {
  name: 'Portgas D. Ace',
  path: 'characters/whitebeard-pirates/portgas-d-ace',
  emotions: ['happy', 'laughing', 'thinking', 'angry', 'scared', 'crying'],
};

function resolveTest(): Resolution {
  return {
    embed: buildOpEmbed('success').setDescription('Test terminé — Ace a fait défiler toutes ses émotions.'),
    effects: [],
    resolutionType: 'aceEmotionsTest.done',
  };
}
