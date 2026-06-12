import type { Transaction } from '@one-piece/db';

import type { View } from '../../../discord/types.js';
import { buildOpEmbed, formatCommand } from '../../../discord/utils/index.js';
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

export function buildFishReminder(prefix: string, expects: string): View {
  return {
    embeds: [
      buildOpEmbed('info')
        .setTitle("Un vieux marin t'attend sur le ponton.")
        .setDescription(`« Avant de prendre la mer, mousse, tu vas apprendre à pêcher. Tape ${formatCommand(prefix, expects)}. »`),
    ],
    components: [],
  };
}
