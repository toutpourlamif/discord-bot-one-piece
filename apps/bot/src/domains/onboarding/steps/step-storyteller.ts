import type { OnboardingStepId, Transaction } from '@one-piece/db';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, type EmbedBuilder } from 'discord.js';

import type { View } from '../../../discord/types.js';
import {
  buildColorDotEmbed,
  buildCustomId,
  buildDialogueEmbed,
  buildItemObtainedEmbed,
  buildOpEmbed,
  type DialogueSpeaker,
} from '../../../discord/utils/index.js';
import { buildAssetUrl } from '../../../shared/build-asset-url.js';
import * as resourceRepository from '../../resource/repository.js';
import { ONBOARDING_FLAVOR_BUTTON_NAME, ONBOARDING_NEXT_BUTTON_NAME } from '../constants.js';
import type { SceneStep } from '../scenario.js';

// TODO: placeholder — swap for the storyteller's real assets once available (borrowing Zoro's in the meantime).
// Même personnage : inconnu pendant qu'il narre le passé, puis révélé une fois qu'on le rencontre sur la place.
const MYSTERIOUS_MAN: DialogueSpeaker = { name: 'Un Homme Mystérieux', path: 'characters/yotsuba-island/roronoa-zoro' };
export const STORYTELLER: DialogueSpeaker = {
  name: 'Le vieux conteur',
  path: 'characters/yotsuba-island/roronoa-zoro',
  emotions: ['scared', 'default'],
};

export const STORYTELLER_FLAVOR_RESPONSES: Record<string, string> = {
  fascinating: 'TODO: texte à retravailler — réponse à "C\'est fascinant"',
  destiny: 'TODO: texte à retravailler — réponse à "Plus tard, je serai le roi des pirates !"',
};

export const storytellerSteps: ReadonlyArray<SceneStep> = [
  { id: 'storyteller-legacy-begins', type: 'scene', embed: buildStorytellerLegacyBeginsEmbed },
  { id: 'storyteller-pirate-era', type: 'scene', embed: buildStorytellerPirateEraEmbed },
  { id: 'storyteller-square', type: 'scene', embed: buildStorytellerSquareEmbed },
  { id: 'storyteller-turns-to-you', type: 'scene', embed: buildStorytellerTurnsToYouEmbed },
  { id: 'storyteller-question', type: 'scene', embed: buildStorytellerQuestionEmbed, buildComponents: buildStorytellerQuestionComponents },
  { id: 'storyteller-coin-flip-answer', type: 'scene', embed: buildStorytellerCoinFlipAnswerEmbed },
  {
    id: 'storyteller-coin-flip',
    type: 'scene',
    embed: buildStorytellerCoinFlipEmbed,
    buildComponents: buildStorytellerCoinFlipComponents,
  },
  { id: 'storyteller-coin-flip-throw', type: 'scene', embed: buildStorytellerCoinFlipThrowEmbed },
  { id: 'storyteller-coin-flip-lands', type: 'scene', embed: buildStorytellerCoinFlipLandsEmbed },
  { id: 'storyteller-coin-flip-reaction', type: 'scene', embed: buildStorytellerCoinFlipReactionEmbed },
  { id: 'storyteller-encyclopedia', type: 'scene', embed: buildStorytellerEncyclopediaEmbed, onAdvance: grantEncyclopedia },
];

function buildStorytellerLegacyBeginsEmbed(): EmbedBuilder {
  return buildDialogueEmbed(MYSTERIOUS_MAN, 'Ses dernières paroles incitèrent les hommes de toute la planète à s’aventurer en mer.', {
    variant: 'goldRogerCoat',
    customVerb: 'explique à voix haute',
  }).setImage(buildAssetUrl('onboarding/gold-roger/legacy-begins.webp'));
}

function buildStorytellerPirateEraEmbed(): EmbedBuilder {
  return buildDialogueEmbed(
    MYSTERIOUS_MAN,
    'Tous se lancèrent sur la route de **Grand Line** dans l’espoir de mettre la main sur ce fameux **trésor**.\n\nLe monde entier connut alors une **grande vague de piraterie**.',
    { variant: 'goldRogerCoat', customVerb: 'continue à expliquer' },
  ).setImage(buildAssetUrl('onboarding/gold-roger/pirate-era.webp'));
}

function buildStorytellerSquareEmbed(): EmbedBuilder {
  return buildOpEmbed().setDescription(
    "*Des années plus tard, sur la place publique de **l'île de Dawn**,\nun vieux conteur ressasse encore l'histoire du roi des pirates.*",
  );
}

function buildStorytellerTurnsToYouEmbed(): EmbedBuilder {
  return buildOpEmbed().setDescription('*Il achève son récit, puis se tourne vers toi.*');
}

function buildStorytellerQuestionEmbed(): EmbedBuilder {
  return buildDialogueEmbed(STORYTELLER, "Toi aussi tu es fan de **Gold Roger** j'imagine !", { customVerb: 'vous demande' });
}

type BuildComponentsParams = { stepId: OnboardingStepId; ownerDiscordId: string };

function buildStorytellerQuestionComponents({ stepId, ownerDiscordId }: BuildComponentsParams): Array<ActionRowBuilder<ButtonBuilder>> {
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(buildCustomId(ONBOARDING_FLAVOR_BUTTON_NAME, ownerDiscordId, 'fascinating'))
      .setLabel('Oui, son histoire est fascinante')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(buildCustomId(ONBOARDING_FLAVOR_BUTTON_NAME, ownerDiscordId, 'destiny'))
      .setLabel('Plus tard, je serai le roi des pirates !')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(buildCustomId(ONBOARDING_NEXT_BUTTON_NAME, ownerDiscordId, stepId))
      .setLabel('Comment savez-vous tout ça ?')
      .setStyle(ButtonStyle.Primary),
  );
  return [row];
}

function buildStorytellerCoinFlipAnswerEmbed(): EmbedBuilder {
  return buildDialogueEmbed(
    STORYTELLER,
    "Comment je sais tout ça ?.. Et bien, j'ai en ma possession **l'Encyclopédie de Gold Roger**.\n\nCe même ouvrage où il a méticuleusement détaillé l'intégralité de son voyage.",
    {
      customVerb: 'vous répond',
    },
  );
}

function buildStorytellerCoinFlipEmbed(): EmbedBuilder {
  return buildDialogueEmbed(
    STORYTELLER,
    "Tu sais quoi ? Je te la laisse si tu me bats à **Pile ou Face**.\n\nMais bon, tu n'as aucune chance!\nJe n'ai **JAMAIS** perdu de ma vie.\n\n*Il ricane.*",
    { customVerb: 'vous propose' },
  );
}

// Pile et Face mènent tous les deux à la suite (issue scriptée) — le 3e segment du customId ne sert qu'à les distinguer, onb-next l'ignore.
function buildStorytellerCoinFlipComponents({ stepId, ownerDiscordId }: BuildComponentsParams): Array<ActionRowBuilder<ButtonBuilder>> {
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(buildCustomId(ONBOARDING_NEXT_BUTTON_NAME, ownerDiscordId, stepId, 'heads'))
      .setLabel('Parier sur Pile')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(buildCustomId(ONBOARDING_NEXT_BUTTON_NAME, ownerDiscordId, stepId, 'tails'))
      .setLabel('Parier sur Face')
      .setStyle(ButtonStyle.Primary),
  );
  return [row];
}

function buildStorytellerCoinFlipThrowEmbed(): EmbedBuilder {
  return buildColorDotEmbed().setDescription('*La pièce est jetée dans les airs.*').setImage(buildAssetUrl('tavern/coin-flip-throw.webp'));
}

function buildStorytellerCoinFlipLandsEmbed(): EmbedBuilder {
  return buildOpEmbed().setDescription('...');
}

function buildStorytellerCoinFlipReactionEmbed(): EmbedBuilder {
  return buildDialogueEmbed(STORYTELLER, "Je n'y crois pas...\n\nSerais-tu...", { customVerb: 'bafouille', emotion: 'scared' });
}

function buildStorytellerEncyclopediaEmbed(): EmbedBuilder {
  return buildDialogueEmbed(STORYTELLER, 'Enfin bref..\nUne promesse est une promesse, elle est tout à toi.', { customVerb: 'vous dit' });
}

async function grantEncyclopedia(playerId: number, tx: Transaction): Promise<View> {
  await resourceRepository.addResource({ playerId, name: 'Encyclopédie de Gold Roger', quantity: 1, options: { client: tx } });
  return { embeds: [buildItemObtainedEmbed('Encyclopédie de Gold Roger', 1)], components: [] };
}
