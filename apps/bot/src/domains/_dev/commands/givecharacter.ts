import { NotFoundError } from '../../../discord/errors.js';
import type { Command } from '../../../discord/types.js';
import { buildOpEmbed, getQuery } from '../../../discord/utils/index.js';
import * as characterRepository from '../../character/repository.js';
import { resolveTargetPlayer } from '../../player/index.js';

// TODO: supprimer avant la prod
export const giveCharacterCommand: Command = {
  names: { fr: 'givecharacter', en: 'givecharacter' },
  aliases: { fr: ['gc'], en: ['gc'] },
  async handler(ctx) {
    const { targetPlayer, rest } = await resolveTargetPlayer(ctx);
    const query = getQuery(rest, { emptyMessage: 'Tu dois fournir un nom.' });

    const [hit] = await characterRepository.searchManyByName(query);
    if (!hit) throw new NotFoundError(`Aucun personnage trouvé pour ${query}.`);

    const createdInstance = await characterRepository.createCharacterInstance(targetPlayer.id, hit.entity.id);

    await ctx.message.reply({ embeds: [buildOpEmbed().setDescription(`${targetPlayer.name} a reçu ${createdInstance.name}.`)] });
  },
};
