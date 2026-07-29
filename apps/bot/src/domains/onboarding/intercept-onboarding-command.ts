import { type Guild, type OnboardingStepId, type SupportedLanguage, db } from '@one-piece/db';

import { getCommandKeywords } from '../../discord/command-names.js';
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

  const { language } = ctx.guild;
  const playerId = ctx.player.id;
  const ownerDiscordId = ctx.player.discordId;
  const step = getStep(stepId);

  if (step.type === 'scene') throw new OnboardingPendingError(buildOnboardingView({ stepId, guild: ctx.guild, ownerDiscordId }));

  const matchesExpectedCommand = getCommandKeywords(command).includes(step.expects) && (step.matchesArgs?.(ctx.args) ?? true);
  if (!matchesExpectedCommand) throw new OnboardingPendingError(step.reminder(ctx.guild, step.command));

  const result = await db.transaction(async (tx) => {
    const locked = await playerRepository.findByIdOrThrow(playerId, tx, { forUpdate: true });
    if (locked.onboardingStep !== stepId)
      throw new OnboardingPendingError(viewForStep({ stepId: locked.onboardingStep, language, guild: ctx.guild, ownerDiscordId }));
    // `run` doit avancer dans la même tx que le lock/recheck ci-dessus, sinon retaper la commande avant le clic
    // "Continuer" relance `run` (ex: double encyclopédie).
    const reply = await step.run(playerId, tx);
    const { nextStep } = await onboardingService.advanceOnboarding(playerId, tx);
    return { reply, nextStep };
  });

  const followUp = viewForStep({ stepId: result.nextStep, language, guild: ctx.guild, ownerDiscordId });
  await ctx.message.reply({
    embeds: [...result.reply.embeds, ...followUp.embeds],
    components: [...result.reply.components, ...followUp.components],
  });
  return true;
}

type ViewForStepParams = { stepId: OnboardingStepId | null; language: SupportedLanguage; guild: Guild; ownerDiscordId: string };

function viewForStep({ stepId, language, guild, ownerDiscordId }: ViewForStepParams): View {
  return stepId === null ? buildOnboardingCompletedView(language) : buildOnboardingView({ stepId, guild, ownerDiscordId });
}
