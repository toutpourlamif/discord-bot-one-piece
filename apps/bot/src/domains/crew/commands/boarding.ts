import type { Command } from '../../../discord/types.js';
import { getCharactersByPlayerId } from '../../character/repository.js';
import { resolveTargetPlayer } from '../../player/index.js';
import * as shipRepository from '../../ship/repository.js';
import { buildBoardingView } from '../utils/build-boarding-view.js';

export const boardingCommand: Command = {
  name: { fr: 'embarquer', en: 'boarding' },
  alias: { fr: 'compo', en: 'embark' },
  async handler(ctx) {
    const { targetPlayer } = await resolveTargetPlayer(ctx);
    const ship = await shipRepository.findByPlayerIdOrThrow(targetPlayer.id);
    const characters = await getCharactersByPlayerId(targetPlayer.id);
    await ctx.message.reply(buildBoardingView(targetPlayer, ship, characters, 0, ctx.message.author.id));
  },
};
