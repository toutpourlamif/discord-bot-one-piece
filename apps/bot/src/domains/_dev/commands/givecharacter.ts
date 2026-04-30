import { NotFoundError, ValidationError } from '../../../discord/errors.js';
import type { Command } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/build-op-embed.js';
import { getTargetUser } from '../../../discord/utils/get-target-user.js';
import * as characterRepository from '../../character/repository.js';
import { findOrCreatePlayer } from '../../player/service.js';

// TODO: supprimer avant la prod
export const giveCharacterCommand: Command = {
  name: 'givecharacter',
  async handler(message, args) {
    const target = getTargetUser(message);
    const query = args
      .filter((arg) => !isUserMention(arg))
      .join(' ')
      .trim();
    if (!query) {
      throw new ValidationError('Tu dois fournir un nom.');
    }

    const [hit] = await characterRepository.searchManyByName(query);
    if (!hit) {
      throw new NotFoundError(`Aucun character trouvé pour ${query}.`);
    }

    const { player } = await findOrCreatePlayer(target.id, target.username);
    await characterRepository.createCharacterInstance(player.id, hit.entity.id);

    await message.reply({ embeds: [buildOpEmbed().setDescription(`${player.name} a reçu ${hit.entity.name}.`)] });
  },
};

function isUserMention(value: string): boolean {
  return /^<@!?\d+>$/.test(value);
}
