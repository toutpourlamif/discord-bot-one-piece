import type { View } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/index.js';

export function buildOnboardingCompletedView(): View {
  return {
    embeds: [buildOpEmbed('success').setTitle('Bon vent, pirate.').setDescription('Ton aventure commence vraiment maintenant.')],
    components: [],
  };
}
