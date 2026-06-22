import type { SupportedLanguage } from '@one-piece/db';

import type { View } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/index.js';
import { translations } from '../translations.js';

export function buildOnboardingCompletedView(language: SupportedLanguage): View {
  return {
    embeds: [
      buildOpEmbed('success')
        .setTitle(translations.onboardingCompletedTitle[language])
        .setDescription(translations.onboardingCompletedDescription[language]),
    ],
    components: [],
  };
}
