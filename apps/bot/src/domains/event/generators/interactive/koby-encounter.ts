import { buildDialogueEmbed, buildOpEmbed, type DialogueSpeaker } from '../../../../discord/utils/index.js';
import type { GeneratorContext, InteractiveGenerator, Resolution } from '../../types.js';

export const kobyEncounter: InteractiveGenerator = {
  key: 'kobyEncounter',
  isInteractive: true,
  oneTime: true,
  probability: () => 0.05,

  initialStep: 'kobyGreets',
  steps: {
    kobyGreets: {
      embed: (_state, ctx) =>
        buildDialogueEmbed(
          KOBY_YOUNG,
          `Attendez... vous êtes le capitaine ${getCaptainSpeaker(ctx).name} ?! J'ai suivi vos exploits depuis le QG de la Marine. Vous êtes devenu une vraie légende.`,
          { emotion: 'scared', verb: 'exclaim' },
        ),
      choices: () => [{ id: 'next', label: 'Suivant', goTo: 'captainReplies' }],
    },
    captainReplies: {
      embed: (_state, ctx) =>
        buildDialogueEmbed(getCaptainSpeaker(ctx), 'Koby. Le petit mousse trouillard est devenu un officier respecté, on dirait.', {
          verb: 'reply',
        }),
      choices: () => [{ id: 'next', label: 'Suivant', goTo: 'kobyVows' }],
    },
    kobyVows: {
      embed: () =>
        buildDialogueEmbed(
          KOBY_YOUNG,
          "Un jour, je vous arrêterai moi-même, au nom de la justice ! Mais pas aujourd'hui. Aujourd'hui, je vous laisse filer.",
          { emotion: 'crying', verb: 'exclaim' },
        ),
      choices: () => [{ id: 'next', label: 'Suivant', goTo: 'captainFarewell' }],
    },
    captainFarewell: {
      embed: (_state, ctx) =>
        buildDialogueEmbed(getCaptainSpeaker(ctx), 'Alors deviens assez fort pour ça. On se recroisera, Koby.', { verb: 'reply' }),
      choices: () => [{ id: 'end', label: 'Terminer', resolve: resolveEncounter }],
    },
  },
};

// TODO: Le déclarer avec tous les NPC
const KOBY_YOUNG: DialogueSpeaker = { name: 'Koby', path: 'characters/marines/koby-young', emotions: ['happy', 'crying', 'scared'] };

function getCaptainSpeaker(ctx: GeneratorContext): DialogueSpeaker {
  const captain = ctx.crew.members.find((member) => member.isCaptain)!;
  return { name: captain.name, path: captain.imageUrl ?? '' };
}

function resolveEncounter(): Resolution {
  return {
    embed: buildOpEmbed().setDescription('Koby esquisse un salut, puis disparaît dans la brume. Votre équipage reprend sa route.'),
    effects: [],
    resolutionType: 'kobyEncounter.done',
    hasConsequences: true,
  };
}
