import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

import { DISCORD_ACTION_ROW_MAX_BUTTONS, DISCORD_BUTTON_LABEL_MAX_LENGTH } from '../../../discord/constants.js';
import type { Command } from '../../../discord/types.js';
import { buildCustomId } from '../../../discord/utils/build-custom-id.js';
import { buildOpEmbed } from '../../../discord/utils/build-op-embed.js';
import { getQuery } from '../../../discord/utils/get-query.js';
import { DOMAIN_EMOJI } from '../../../shared/domains.js';
import { truncate } from '../../../shared/utils.js';
import { INFO_BUTTON_NAME } from '../interactions/info-button.js';
import { infoProviderByDomain, infoProviders } from '../registry.js';

const MIN_QUERY_LENGTH = 2;
const ENTITIES_DISPLAYED_LIMIT = 10;

export const infoCommand: Command = {
  name: 'info',
  async handler(message, args) {
    const query = getQuery(args, `Ta recherche doit faire au moins ${MIN_QUERY_LENGTH} caractères.`);
    if (query.length < MIN_QUERY_LENGTH) {
      // TODO: Throw "MalformatedError" aulieu d'afficher un msg
      await message.reply(`Ta recherche doit faire au moins ${MIN_QUERY_LENGTH} caractères.`);
      return;
    }

    const hitsPerProvider = await Promise.all(infoProviders.map((provider) => provider.searchManyByName(query)));
    const topHits = hitsPerProvider
      .flat()
      .sort((a, b) => b.score - a.score)
      .slice(0, ENTITIES_DISPLAYED_LIMIT);

    if (topHits.length === 0) {
      await message.reply({ embeds: [buildOpEmbed('info').setDescription(`Aucun résultat pour "${query}".`)] });
      return;
    }

    if (topHits.length === 1) {
      const [single] = topHits;
      if (!single) return;
      const provider = infoProviderByDomain.get(single.domain);
      if (!provider) return;
      await message.reply({ embeds: [await provider.buildEmbedById(single.id)] });
      return;
    }

    const hitsBulletList = topHits.map((hit) => `- ${hit.name} (${DOMAIN_EMOJI[hit.domain]})`).join('\n');
    const embed = buildOpEmbed('info').setTitle('Plusieurs résultats, choisis :').setDescription(hitsBulletList);

    const buttonHits = topHits.slice(0, DISCORD_ACTION_ROW_MAX_BUTTONS);
    const buttons = buttonHits.map((hit) =>
      new ButtonBuilder()
        .setCustomId(buildCustomId(INFO_BUTTON_NAME, hit.domain, hit.id))
        .setEmoji(DOMAIN_EMOJI[hit.domain])
        .setLabel(truncate(hit.name, DISCORD_BUTTON_LABEL_MAX_LENGTH))
        .setStyle(ButtonStyle.Primary),
    );
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);
    await message.reply({ embeds: [embed], components: [row] });
  },
};
