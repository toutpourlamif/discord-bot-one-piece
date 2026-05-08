import type { Command } from '../../../discord/types.js';
import { getCharactersByPlayerId } from '../../character/repository.js';
import { resolveTargetPlayer } from '../../player/index.js';
import * as shipRepository from '../../ship/repository.js';
import { buildCrewView } from '../utils/build-crew-view.js';

export const crewCommand: Command = {
  name: ['crew', 'equipage', 'team', 'equipe', 'reserve', 'reserv'],
  async handler(ctx) {
    const { targetPlayer } = await resolveTargetPlayer(ctx);
    const ship = await shipRepository.findByPlayerIdOrThrow(targetPlayer.id);
    const characters = await getCharactersByPlayerId(targetPlayer.id);
    await ctx.message.reply(buildCrewView(targetPlayer, ship, characters, 0, ctx.message.author.id));
  },
};
