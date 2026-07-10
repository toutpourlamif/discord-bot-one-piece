import type { OnboardingStepId } from '@one-piece/db';
import type { EmbedBuilder } from 'discord.js';

import { buildOpEmbed } from '../../../discord/utils/index.js';
import { buildAssetUrl } from '../../../shared/build-asset-url.js';
import type { SceneStep } from '../scenario.js';

type GoldRogerScene = { id: OnboardingStepId; text: string | null; assetPath: string };

// TODO:: Brancher les assets
const GOLD_ROGER_SCENES: ReadonlyArray<GoldRogerScene> = [
  {
    id: 'gold-roger-distant-march',
    text: 'La richesse. La gloire. Le pouvoir.',
    assetPath: 'onboarding/gold-roger/distant-march-300.webp',
  },
  {
    id: 'gold-roger-close-march',
    text: 'Cet homme avait amassé tout ce que le monde avait à offrir.',
    assetPath: 'onboarding/gold-roger/close-march.webp',
  },
  { id: 'gold-roger-chained-hands', text: null, assetPath: 'onboarding/gold-roger/chained-hands.webp' },
  {
    id: 'gold-roger-climbs-stairs',
    text: 'Et alors qu’il marchait vers sa propre mort.',
    assetPath: 'onboarding/gold-roger/climbs-stairs.webp',
  },
  { id: 'gold-roger-blade-view', text: 'Il avait tout d’un roi, fier et digne.', assetPath: 'onboarding/gold-roger/blade-view.webp' },
  {
    id: 'gold-roger-accepts-fate',
    text: '« La passion et les rêves sont comme le temps. »',
    assetPath: 'onboarding/gold-roger/accepts-fate.webp',
  },
  { id: 'gold-roger-blades-rise', text: '« Rien ne peut les arrêter. »', assetPath: 'onboarding/gold-roger/blades-rise.webp' },
  { id: 'gold-roger-blade-view-behind', text: null, assetPath: 'onboarding/gold-roger/blade-view-behind.webp' },
  {
    id: 'gold-roger-crowd-reaction',
    text: '« Et il en sera ainsi tant qu’il aura des hommes prêts à donner un sens au mot “Liberté”. »',
    assetPath: 'onboarding/gold-roger/crowd-reaction.webp',
  },
  { id: 'gold-roger-laughs', text: 'Il ria.', assetPath: 'onboarding/gold-roger/laughs.webp' },
  {
    id: 'gold-roger-treasure-reveal',
    text: '« Mon trésor, je vous le laisse si vous voulez ; trouvez-le ! Je l’ai laissé quelque part dans ce monde. »',
    assetPath: 'onboarding/gold-roger/treasure-reveal.webp',
  },
  {
    id: 'gold-roger-legacy-begins',
    text: 'Ses dernières paroles incitèrent les hommes de toute la planète à s’aventurer en mer.',
    assetPath: 'onboarding/gold-roger/legacy-begins.webp',
  },
  {
    id: 'gold-roger-pirate-era',
    text: 'Tous se lancèrent sur la route de Grand Line dans l’espoir de mettre la main sur ce fameux trésor. Le monde entier connut alors une grande vague de piraterie.',
    assetPath: 'onboarding/gold-roger/pirate-era.webp',
  },
];

export const goldRogerSteps: ReadonlyArray<SceneStep> = GOLD_ROGER_SCENES.map(buildGoldRogerScene);

function buildGoldRogerScene({ id, text, assetPath }: GoldRogerScene): SceneStep {
  return {
    id,
    type: 'scene',
    embed: (): EmbedBuilder => buildOpEmbed().setDescription(text).setImage(buildAssetUrl(assetPath)),
  };
}
