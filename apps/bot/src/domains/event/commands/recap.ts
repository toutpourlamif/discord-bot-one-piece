import type { Command } from '../../../discord/types.js';
import { buildOnboardingView } from '../../onboarding/index.js';
import { buildRecapView } from '../recap/build-recap-view.js';

export const recapCommand: Command = {
  name: ['recap', 'r'],
  requiresSynchronization: false,
  isAllowedDuringOnboarding: true,
  async handler(ctx) {
    if (ctx.player.onboardingStep !== null) {
      await ctx.message.reply(buildOnboardingView(ctx.player));
      return;
    }
    await ctx.message.reply(await buildRecapView(ctx.player));
  },
};
