import type { SupportedLanguage } from '@one-piece/db';

import type { View } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/index.js';
import { texts } from '../texts.js';

export function buildOnboardingCompletedView(language: SupportedLanguage): View {
  return {
    embeds: [buildOpEmbed('success').setTitle(texts.completedTitle[language]).setDescription(texts.completedDescription[language])],
    components: [],
  };
}
