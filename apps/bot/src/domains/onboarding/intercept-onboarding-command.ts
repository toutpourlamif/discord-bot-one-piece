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

  const { prefix } = ctx.guild;
  const playerId = ctx.player.id;
  const step = getStep(stepId);

  if (step.type === 'scene') throw new OnboardingPendingError(buildOnboardingView(ctx.player, prefix));

  const commandNames = Array.isArray(command.name) ? command.name : [command.name];
  if (!commandNames.includes(step.expects)) throw new OnboardingPendingError(step.reminder(prefix, step.expects));

  const result = await db.transaction(async (tx) => {
    const locked = await playerRepository.findByIdOrThrow(playerId, tx, { forUpdate: true });
    if (locked.onboardingStep !== stepId) throw new OnboardingPendingError(buildOnboardingView(ctx.player, prefix));
    const reply = await step.run(playerId, tx);
    const { nextStep } = await onboardingService.advanceOnboarding(playerId, tx);
    return { reply, nextStep };
  });

  await ctx.message.reply(result.reply);
  const followUp =
    result.nextStep === null
      ? buildOnboardingCompletedView()
      : buildOnboardingView({ ...ctx.player, onboardingStep: result.nextStep }, prefix);
  await ctx.message.reply(followUp);
  return true;
}
