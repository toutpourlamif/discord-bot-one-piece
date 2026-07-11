import type { Guild, Transaction } from '@one-piece/db';

import type { Command, View } from '../../../discord/types.js';
import { buildOpEmbed, getFormattedCommand } from '../../../discord/utils/index.js';
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

export function buildFishReminder(guild: Guild, fishingCommand: Command): View {
  return {
    embeds: [
      buildOpEmbed('info')
        .setTitle("Un vieux marin t'attend sur le ponton.")
        .setDescription(
          `« Avant de prendre la mer, mousse, tu vas apprendre à pêcher. Tape ${getFormattedCommand(guild, fishingCommand)}. »`,
        ),
    ],
    components: [],
  };
}
