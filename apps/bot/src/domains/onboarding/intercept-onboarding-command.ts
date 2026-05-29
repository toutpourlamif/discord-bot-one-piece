import { db } from '@one-piece/db';

import type { Command, CommandContext } from '../../discord/types.js';
import * as playerRepository from '../player/repository.js';

import { OnboardingPendingError } from './errors.js';
import { getStep } from './script.js';
import * as onboardingService from './services/index.js';
import { buildOnboardingCompletedView, buildOnboardingView } from './view.js';

type GateArgs = { ctx: CommandContext; command: Command };

export async function interceptOnboardingCommand({ ctx, command }: GateArgs): Promise<boolean> {
  const stepId = ctx.player.onboardingStep;
  if (stepId === null) return false;
  if (command.requiresOnboardingFinished === false) return false;

  const step = getStep(stepId);

  if (step.type === 'scene') {
    throw new OnboardingPendingError(buildOnboardingView(ctx.player, ctx.guild.prefix));
  }

  const commandNames = Array.isArray(command.name) ? command.name : [command.name];
  if (!commandNames.includes(step.expects)) {
    throw new OnboardingPendingError(step.reminder(ctx.guild.prefix, step.expects));
  }

  const result = await db.transaction(async (tx) => {
    // Verrou + re-lecture : deux commandes simultanées ne doivent pas avancer deux fois.
    const locked = await playerRepository.findByIdOrThrow(ctx.player.id, tx, { forUpdate: true });
    if (locked.onboardingStep !== stepId) throw new OnboardingPendingError(buildOnboardingView(ctx.player, ctx.guild.prefix));
    const reply = await step.run(ctx.player.id, tx);
    const { nextStep } = await onboardingService.advanceOnboarding(ctx.player.id, tx);
    return { reply, nextStep };
  });

  await ctx.message.reply(result.reply);
  const followUp =
    result.nextStep === null
      ? buildOnboardingCompletedView()
      : buildOnboardingView({ ...ctx.player, onboardingStep: result.nextStep }, ctx.guild.prefix);
  await ctx.message.reply(followUp);
  return true;
}
