import { PLAYER_STAT_KEYS, type PlayerStatKey } from '@one-piece/db';

import { ValidationError } from '../../../discord/errors.js';
import type { Command } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/index.js';
import { parseIntegerArg } from '../../../discord/utils/parse-integer-arg.js';
import { resolveTargetPlayer } from '../../player/index.js';
import { adjustStat, getStatRank } from '../../player/stats/index.js';

export const setStatCommand: Command = {
  names: { fr: 'setstat', en: 'setstat' },
  async handler(ctx) {
    const { targetPlayer, rest } = await resolveTargetPlayer(ctx);
    const [rawStatKey, rawValue] = rest;

    if (!isPlayerStatKey(rawStatKey)) {
      throw new ValidationError(`Usage : !setstat <${PLAYER_STAT_KEYS.join('|')}> <valeur -100 à 100>.`);
    }

    const targetValue = parseIntegerArg(rawValue);
    const updatedPlayer = await adjustStat(targetPlayer.id, rawStatKey, targetValue - targetPlayer[rawStatKey]);
    const { pips, label } = getStatRank(rawStatKey, updatedPlayer[rawStatKey]);

    const embed = buildOpEmbed('success')
      .setTitle('Stat modifiée')
      .setDescription(`${targetPlayer.name} — ${rawStatKey} : ${updatedPlayer[rawStatKey]} (${pips} ${label})`);
    await ctx.message.reply({ embeds: [embed] });
  },
};

function isPlayerStatKey(value: string | undefined): value is PlayerStatKey {
  return PLAYER_STAT_KEYS.includes(value as PlayerStatKey);
}
