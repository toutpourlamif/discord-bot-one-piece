import { type OnboardingStepId, type SupportedLanguage, db } from '@one-piece/db';

import { getCommandKeywords } from '../../discord/command-names.js';
import type { Command, CommandContext, View } from '../../discord/types.js';
import * as playerRepository from '../player/repository.js';

import { OnboardingPendingError } from './errors.js';
import * as onboardingService from './services/index.js';
import { getStep } from './step-registry.js';
import { buildOnboardingCompletedView } from './views/build-onboarding-completed-view.js';
import { buildNextButtonRow, buildOnboardingView, DEFAULT_SCENE_BUTTON_LABEL } from './views/build-onboarding-view.js';

type GateArgs = { ctx: CommandContext; command: Command };

export async function interceptOnboardingCommand({ ctx, command }: GateArgs): Promise<boolean> {
  const stepId = ctx.player.onboardingStep;
  if (stepId === null) return false;
  if (command.requiresOnboardingFinished === false) return false;

  const { language, prefix } = ctx.guild;
  const playerId = ctx.player.id;
  const ownerDiscordId = ctx.player.discordId;
  const step = getStep(stepId);

  if (step.type === 'scene') throw new OnboardingPendingError(buildOnboardingView({ stepId, prefix, ownerDiscordId }));

  const matchesExpectedCommand = getCommandKeywords(command).includes(step.expects) && (step.matchesArgs?.(ctx.args) ?? true);
  if (!matchesExpectedCommand) throw new OnboardingPendingError(step.reminder(prefix, step.expects));

  const reply = await db.transaction(async (tx) => {
    const locked = await playerRepository.findByIdOrThrow(playerId, tx, { forUpdate: true });
    if (locked.onboardingStep !== stepId)
      throw new OnboardingPendingError(viewForStep({ stepId: locked.onboardingStep, language, prefix, ownerDiscordId }));
    const result = await step.run(playerId, tx);
    // `run` doit avancer dans la même tx que le lock/recheck ci-dessus, sinon retaper la commande avant le clic
    // "Continuer" relance `run` (ex: double encyclopédie). Le bouton posté ci-dessous garde volontairement l'ANCIEN
    // stepId : au clic, onb-next constate que ce n'est plus le step courant (déjà avancé) et se contente de
    // re-render la vue courante — c'est le mécanisme "clic obsolète" déjà en place, réutilisé comme reveal.
    await onboardingService.advanceOnboarding(playerId, tx);
    return result;
  });

  await ctx.message.reply({
    embeds: reply.embeds,
    components: [buildNextButtonRow({ stepId, label: DEFAULT_SCENE_BUTTON_LABEL, ownerDiscordId })],
    files: reply.files,
  });
  return true;
}

type ViewForStepParams = { stepId: OnboardingStepId | null; language: SupportedLanguage; prefix: string; ownerDiscordId: string };

function viewForStep({ stepId, language, prefix, ownerDiscordId }: ViewForStepParams): View {
  return stepId === null ? buildOnboardingCompletedView(language) : buildOnboardingView({ stepId, prefix, ownerDiscordId });
}
