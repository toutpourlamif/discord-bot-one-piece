import { NotFoundError } from '../../../discord/errors.js';
import type { Command } from '../../../discord/types.js';
import { findOrCreatePlayer } from '../../player/service.js';
import { getCharactersByPlayerId } from '../repository.js';
import { buildSetCaptainView } from '../set-captain-view.js';

export const setCaptainCommand: Command = {
  name: 'setcaptain',
  async handler(message) {
    const { player } = await findOrCreatePlayer(message.author.id, message.author.username);
    const characters = await getCharactersByPlayerId(player.id);
    const crew = characters.filter((character) => character.joinedCrewAt !== null);

    if (crew.length === 0) {
      throw new NotFoundError("Tu n'as aucun character dans ton équipage.");
    }

    await message.reply(buildSetCaptainView(player, crew));
  },
};
