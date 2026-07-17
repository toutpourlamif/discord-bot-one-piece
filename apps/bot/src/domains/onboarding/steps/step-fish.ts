import type { SupportedLanguage, Transaction } from '@one-piece/db';

import { buildCommandHint } from '../../../discord/command-names.js';
import type { View } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/index.js';
import { fishingCommand } from '../../fishing/commands/fishing.js';
import { runFishingAttempt } from '../../fishing/service.js';

export async function runFishStep(playerId: number, tx: Transaction): Promise<View> {
  const result = await runFishingAttempt(playerId, tx);
  return {
    embeds: [
      buildOpEmbed()
        .setTitle('🎣 Ta première prise')
        .setDescription(`Tu attrapes ${result.quantity}× **${result.resourceName}**. La mer t'a souri.`),
    ],
    components: [],
  };
}

export function buildFishReminder(prefix: string, language: SupportedLanguage): View {
  return {
    embeds: [
      buildOpEmbed('info')
        .setTitle("Un vieux marin t'attend sur le ponton.")
        .setDescription(
          `« Avant de prendre la mer, mousse, tu vas apprendre à pêcher. »\n\n\`${buildCommandHint(prefix, fishingCommand, language)}\``,
        ),
    ],
    components: [],
  };
}
