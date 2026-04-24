import { DISCORD_ACTION_ROW_MAX_BUTTONS } from '../../../discord/constants.js';
import type { Command } from '../../../discord/types.js';
import { searchManyByName } from '../repository.js';
import { buildDisambiguationRow, buildInfoEmbed } from '../ui.js';

export const infoCommand: Command = {
  name: 'info',
  async handler(message, args) {
    const query = args.join(' ').trim();
    if (query.length < 2) {
      await message.reply('Ta recherche doit faire au moins 2 caractères.');
      return;
    }
    const fruits = await searchManyByName(query);
    const [fruit, ...rest] = fruits;
    if (!fruit) {
      await message.reply(`Aucun résultat pour "${query}".`);
      return;
    }
    if (rest.length === 0) {
      await message.reply({ embeds: [buildInfoEmbed(fruit)] });
      return;
    }
    if (fruits.length <= DISCORD_ACTION_ROW_MAX_BUTTONS) {
      await message.reply({
        content: 'Plusieurs résultats, choisis :',
        components: [buildDisambiguationRow(fruits)],
      });
      return;
    }
    await message.reply(`Trop de résultats (${fruits.length}), affine ta recherche.`);
  },
};
