import { NotFoundError } from '../../../discord/errors.js';
import type { Command } from '../../../discord/types.js';
import { buildOpEmbed, getQuery, getTargetUser } from '../../../discord/utils/index.js';
import * as characterRepository from '../../character/repository.js';
import { findOrCreatePlayer } from '../../player/service.js';

// TODO: supprimer avant la prod
export const giveCharacterCommand: Command = {
  name: 'givecharacter',
  async handler(message, args) {
    const target = getTargetUser(message);
    const query = getQuery(getCharacterQueryArgs(args), { emptyMessage: 'Tu dois fournir un nom.' });

    const [hit] = await characterRepository.searchManyByName(query);
    if (!hit) {
      throw new NotFoundError(`Aucun character trouvé pour ${query}.`);
    }

    const { player } = await findOrCreatePlayer(target.id, target.username);
    const createdInstance = await characterRepository.createCharacterInstance(player.id, hit.entity.id);

    await message.reply({ embeds: [buildOpEmbed().setDescription(`${player.name} a reçu ${createdInstance.name}.`)] });
  },
};

function getCharacterQueryArgs(args: Array<string>): Array<string> {
  const [firstArg, ...queryArgs] = args;
  return firstArg && isUserMention(firstArg) ? queryArgs : args;
}

function isUserMention(value: string): boolean {
  return /^<@!?\d+>$/.test(value);
}
