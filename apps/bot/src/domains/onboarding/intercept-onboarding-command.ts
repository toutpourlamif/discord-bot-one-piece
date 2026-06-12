import { type OnboardingStepId, type SupportedLanguage, db } from '@one-piece/db';

import type { Command, CommandContext, View } from '../../discord/types.js';
import * as playerRepository from '../player/repository.js';

import { OnboardingPendingError } from './errors.js';
import * as onboardingService from './services/index.js';
import { getStep } from './step-registry.js';
import { buildOnboardingCompletedView } from './views/build-onboarding-completed-view.js';
import { buildOnboardingView } from './views/build-onboarding-view.js';

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

  const commandNames = Array.isArray(command.name) ? command.name : [command.name];
  if (!commandNames.includes(step.expects)) throw new OnboardingPendingError(step.reminder(prefix, step.expects));

  const result = await db.transaction(async (tx) => {
    const locked = await playerRepository.findByIdOrThrow(playerId, tx, { forUpdate: true });
    if (locked.onboardingStep !== stepId)
      throw new OnboardingPendingError(viewForStep({ stepId: locked.onboardingStep, language, prefix, ownerDiscordId }));
    const reply = await step.run(playerId, tx);
    const { nextStep } = await onboardingService.advanceOnboarding(playerId, tx);
    return { reply, nextStep };
  });

  const followUp = viewForStep({ stepId: result.nextStep, language, prefix, ownerDiscordId });
  await ctx.message.reply({
    embeds: [...result.reply.embeds, ...followUp.embeds],
    components: [...result.reply.components, ...followUp.components],
  });
  return true;
}

type ViewForStepParams = { stepId: OnboardingStepId | null; language: SupportedLanguage; prefix: string; ownerDiscordId: string };

function viewForStep({ stepId, language, prefix, ownerDiscordId }: ViewForStepParams): View {
  return stepId === null ? buildOnboardingCompletedView(language) : buildOnboardingView({ stepId, prefix, ownerDiscordId });
}
