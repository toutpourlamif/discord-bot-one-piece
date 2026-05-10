import type { Player } from '@one-piece/db';

import { NotFoundError, ValidationError } from '../../../discord/errors.js';
import type { Command, CommandContext } from '../../../discord/types.js';
import * as historyRepository from '../../history/repository.js';
import * as playerRepository from '../../player/repository.js';
import { findOrCreatePlayer } from '../../player/service.js';

import { replyDebugData } from './debug/utils.js';

async function resolveHistoryPlayer(ctx: CommandContext): Promise<Player> {
  if (ctx.args.length === 0) return ctx.player;

  const mentioned = ctx.message.mentions.users.first();
  if (mentioned) {
    const { player } = await findOrCreatePlayer(mentioned.id, mentioned.username, ctx.guild.id);
    return player;
  }

  const targetName = ctx.args.join(' ').trim();
  const matches = await playerRepository.findManyByName(targetName, ctx.guild.id);

  if (matches.length === 0) {
    throw new NotFoundError(`Joueur introuvable: ${targetName}.`);
  }

  if (matches.length > 1) {
    throw new ValidationError(`Plusieurs joueurs correspondent à ${targetName}. Utilise une mention Discord.`);
  }

  return matches[0]!;
}

export const showHistoryCommand: Command = {
  name: ['showHistory', 'show-history'],
  async handler(ctx) {
    const targetPlayer = await resolveHistoryPlayer(ctx);
    const history = await historyRepository.loadFullForPlayer(targetPlayer.id);

    await replyDebugData(ctx.message, history);
  },
};
