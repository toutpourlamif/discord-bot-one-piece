import { NotFoundError, ValidationError } from '../../../discord/errors.js';
import type { Command } from '../../../discord/types.js';
import { giveCharacter } from '../../character/index.js';
import { searchManyByName } from '../../character/repository.js';
import { findOrCreatePlayer } from '../../player/service.js';

// TODO: supprimer avant la prod
export const giveCharacterCommand: Command = {
  name: 'givecharacter',
  async handler(message, args) {
    const query = args.join(' ').trim();
    if (!query) {
      throw new ValidationError('Tu dois fournir un nom.');
    }

    const [hit] = await searchManyByName(query);
    if (!hit) {
      throw new NotFoundError(`Aucun character trouvé pour ${query}.`);
    }

    const { player } = await findOrCreatePlayer(message.author.id, message.author.username);
    await giveCharacter(player.id, hit.entity.id);

    await message.reply(`Tu as reçu ${hit.entity.name}.`);
  },
};
