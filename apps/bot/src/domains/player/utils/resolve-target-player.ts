import type { Player } from '@one-piece/db';

import { NotFoundError } from '../../../discord/errors.js';
import type { CommandContext } from '../../../discord/types.js';
import { findOrCreatePlayer } from '../service.js';

const DISCORD_ID_REGEX = /^\d{17,20}$/;

type ResolveTargetPlayerResult = {
  targetPlayer: Player;
  restArgs: Array<string>;
};

export async function resolveTargetPlayer(ctx: CommandContext): Promise<ResolveTargetPlayerResult> {
  const mentioned = ctx.message.mentions.users.first();
  if (mentioned) {
    const { player } = await findOrCreatePlayer(mentioned.id, mentioned.username, ctx.guild.id);
    return { targetPlayer: player, restArgs: ctx.args.slice(1) };
  }

  const rawTargetId = ctx.args[0];
  if (!rawTargetId || !DISCORD_ID_REGEX.test(rawTargetId)) return { targetPlayer: ctx.player, restArgs: ctx.args };

  const targetUser = await ctx.message.client.users.fetch(rawTargetId).catch(() => null);
  if (!targetUser) throw new NotFoundError(`Joueur introuvable: ${rawTargetId}`);

  const { player } = await findOrCreatePlayer(targetUser.id, targetUser.username, ctx.guild.id);
  return { targetPlayer: player, restArgs: ctx.args.slice(1) };
}
