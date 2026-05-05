import type { Command } from '../../../discord/types.js';
import { getTargetUser } from '../../../discord/utils/index.js';
import { getCharactersByPlayerId } from '../../character/repository.js';
import { findOrCreatePlayer } from '../../player/service.js';
import * as shipRepository from '../../ship/repository.js';
import { buildCrewView } from '../utils/build-crew-view.js';

export const crewCommand: Command = {
  name: ['crew', 'equipage', 'team', 'equipe', 'reserve', 'reserv'],
  async handler({ message }) {
    const target = getTargetUser(message);
    const { player: targetPlayer } = await findOrCreatePlayer(target.id, target.username, message.guildId!);
    const ship = await shipRepository.findByPlayerIdOrThrow(targetPlayer.id);
    const characters = await getCharactersByPlayerId(targetPlayer.id);
    await message.reply(buildCrewView(targetPlayer, ship, characters, 0, message.author.id));
  },
};
