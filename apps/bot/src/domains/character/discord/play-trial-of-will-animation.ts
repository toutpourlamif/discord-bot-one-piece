import type { EmbedBuilder, Message } from 'discord.js';

import { buildDialogueEmbed, type DialogueSpeaker } from '../../../discord/utils/index.js';
import { sleep } from '../../../shared/utils.js';
import type { TrialOfWillCriterionOutcome, TrialOfWillResult } from '../trial-of-will/types.js';

const TRIAL_OF_WILL_STEP_DELAY_MS = 1500;

export async function playTrialOfWillAnimation(message: Message, speaker: DialogueSpeaker, result: TrialOfWillResult): Promise<void> {
  // Le recrutement (DB) est déjà tranché avant l'animation : si Discord refuse un edit (message supprimé, rate
  // limit...), on abandonne juste l'animation plutôt que de faire planter la commande pour un souci purement cosmétique.
  try {
    for (const outcome of result.outcomes) {
      await sleep(TRIAL_OF_WILL_STEP_DELAY_MS);
      await message.edit({ embeds: [buildOutcomeEmbed(speaker, outcome)] });
    }

    await sleep(TRIAL_OF_WILL_STEP_DELAY_MS);
    await message.edit({ embeds: [buildVerdictEmbed(speaker, result)] });
    // eslint-disable-next-line unused-imports/no-unused-vars -- obligé d'avoir error
  } catch (error) {
    console.warn(`Impossible d'animer l'Épreuve de Volonté sur le message ${message.id}.`);
  }
}

function buildOutcomeEmbed(speaker: DialogueSpeaker, outcome: TrialOfWillCriterionOutcome): EmbedBuilder {
  const text = outcome.passed ? outcome.criterion.successText : outcome.criterion.failureText;
  return buildDialogueEmbed(speaker, text, { variant: outcome.passed ? 'success' : 'error' });
}

function buildVerdictEmbed(speaker: DialogueSpeaker, result: TrialOfWillResult): EmbedBuilder {
  const text = result.passed
    ? `${speaker.name} hoche la tête. "Très bien... Je vous suis." (${result.percentage}% de conviction)`
    : `${speaker.name} secoue la tête. "Pas cette fois." (${result.percentage}% de conviction)`;
  return buildDialogueEmbed(speaker, text, { variant: result.passed ? 'success' : 'error' });
}
