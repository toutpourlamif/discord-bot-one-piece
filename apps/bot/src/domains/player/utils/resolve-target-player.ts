import type { Player } from '@one-piece/db';

import type { CommandContext } from '../../../discord/types.js';
import { findOrCreatePlayer } from '../service.js';

export async function resolveTargetPlayer(ctx: CommandContext): Promise<{ targetPlayer: Player; rest: Array<string> }> {
  const mentioned = ctx.message.mentions.users.first();
  if (!mentioned) return { targetPlayer: ctx.player, rest: ctx.args };

  const { player } = await findOrCreatePlayer(mentioned.id, mentioned.username, ctx.guild.id);
  return { targetPlayer: player, rest: ctx.args.slice(1) };
}
