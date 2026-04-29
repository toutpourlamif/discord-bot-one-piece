import type { Command } from '../../../discord/types.js';
import { getTargetUser } from '../../../discord/utils/index.js';
import { getCharactersByPlayerId } from '../../character/repository.js';
import { findOrCreatePlayer } from '../../player/service.js';
import * as shipRepository from '../../ship/repository.js';
import { buildCrewView } from '../utils/build-crew-view.js';

export const crewCommand: Command = {
  // TODO: Accept alias such as "!reserv" !"members"..
  // https://github.com/toutpourlamif/discord-bot-one-piece/issues/118
  name: 'crew',
  async handler(message) {
    const target = getTargetUser(message);
    const { player } = await findOrCreatePlayer(target.id, target.username);
    const ship = await shipRepository.findByPlayerIdOrThrow(player.id);
    const characters = await getCharactersByPlayerId(player.id);
    await message.reply(buildCrewView(player, ship, characters, 0));
  },
};
