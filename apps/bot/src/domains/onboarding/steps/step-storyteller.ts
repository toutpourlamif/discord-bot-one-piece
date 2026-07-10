import type { OnboardingStepId } from '@one-piece/db';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, type EmbedBuilder } from 'discord.js';

import { buildCustomId, buildOpEmbed } from '../../../discord/utils/index.js';
import { ONBOARDING_FLAVOR_BUTTON_NAME, ONBOARDING_NEXT_BUTTON_NAME } from '../constants.js';
import type { SceneStep } from '../scenario.js';

export const STORYTELLER_FLAVOR_RESPONSES: Record<string, string> = {
  fascinating: 'TODO: texte à retravailler — réponse à "C\'est fascinant"',
  destiny: 'TODO: texte à retravailler — réponse à "Plus tard, je serai le roi des pirates !"',
};

export const storytellerSteps: ReadonlyArray<SceneStep> = [
  { id: 'storyteller-square', type: 'scene', embed: buildStorytellerSquareEmbed },
  { id: 'storyteller-turns-to-you', type: 'scene', embed: buildStorytellerTurnsToYouEmbed },
  { id: 'storyteller-question', type: 'scene', embed: buildStorytellerQuestionEmbed, buildComponents: buildStorytellerQuestionComponents },
  {
    id: 'storyteller-coin-flip',
    type: 'scene',
    embed: buildStorytellerCoinFlipEmbed,
    buildComponents: buildStorytellerCoinFlipComponents,
  },
  { id: 'storyteller-encyclopedia', type: 'scene', embed: buildStorytellerEncyclopediaEmbed },
];

function buildStorytellerSquareEmbed(): EmbedBuilder {
  return buildOpEmbed().setDescription(
    "Des années plus tard, sur la place publique de Dawn Island, un vieux conteur ressasse encore cette histoire à qui veut l'entendre.",
  );
}

function buildStorytellerTurnsToYouEmbed(): EmbedBuilder {
  return buildOpEmbed().setDescription('Il achève son récit, puis se tourne vers toi.');
}

function buildStorytellerQuestionEmbed(): EmbedBuilder {
  return buildOpEmbed().setDescription("« C'est par lui que tu es motivé, j'imagine ? »");
}

type BuildComponentsParams = { stepId: OnboardingStepId; ownerDiscordId: string };

function buildStorytellerQuestionComponents({ stepId, ownerDiscordId }: BuildComponentsParams): Array<ActionRowBuilder<ButtonBuilder>> {
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(buildCustomId(ONBOARDING_FLAVOR_BUTTON_NAME, ownerDiscordId, 'fascinating'))
      .setLabel("C'est fascinant")
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

function buildStorytellerCoinFlipEmbed(): EmbedBuilder {
  return buildOpEmbed().setDescription(
    "« Tu ne me croiras pas... je possède l'encyclopédie de Gold Roger, là où il a tout détaillé son voyage. " +
      "Je te la laisse si tu me bats à Pile ou Face. Mais bon, tu n'as aucune chance, je n'ai jamais perdu de ma vie. »",
  );
}

// Pile et Face mènent tous les deux à la suite (issue scriptée) — le 3e segment du customId ne sert qu'à les distinguer, onb-next l'ignore.
function buildStorytellerCoinFlipComponents({ stepId, ownerDiscordId }: BuildComponentsParams): Array<ActionRowBuilder<ButtonBuilder>> {
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(buildCustomId(ONBOARDING_NEXT_BUTTON_NAME, ownerDiscordId, stepId, 'heads'))
      .setLabel('Pile')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(buildCustomId(ONBOARDING_NEXT_BUTTON_NAME, ownerDiscordId, stepId, 'tails'))
      .setLabel('Face')
      .setStyle(ButtonStyle.Primary),
  );
  return [row];
}

function buildStorytellerEncyclopediaEmbed(): EmbedBuilder {
  return buildOpEmbed().setDescription("Il te tend l'encyclopédie.");
}
