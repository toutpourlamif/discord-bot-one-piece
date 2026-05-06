import type { Player } from '@one-piece/db';

import type { CommandContext } from '../../../discord/types.js';
import { findOrCreatePlayer } from '../service.js';

export async function resolveTargetPlayer(ctx: CommandContext): Promise<Player> {
  const mentioned = ctx.message.mentions.users.first();
  if (!mentioned) return ctx.player;

  const { player } = await findOrCreatePlayer(mentioned.id, mentioned.username, ctx.guild.id);
  return player;
}
