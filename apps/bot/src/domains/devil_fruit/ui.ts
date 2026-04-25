import type { DevilFruitTemplate } from '@one-piece/db';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, type EmbedBuilder } from 'discord.js';

import { DISCORD_BUTTON_LABEL_MAX_LENGTH } from '../../discord/constants.js';
import { createOpEmbed } from '../../discord/embed/create-op-embed.js';
import { buildCustomId } from '../../discord/utils/build-custom-id.js';
import { buildAssetUrl } from '../../shared/build-asset-url.js';
import { truncate } from '../../shared/utils.js';

export const INFO_BUTTON_NAME = 'infofruit';

export function buildDisambiguationRow(fruits: Array<DevilFruitTemplate>): ActionRowBuilder<ButtonBuilder> {
  const buttons = fruits.map((fruit) =>
    new ButtonBuilder()
      .setCustomId(buildCustomId(INFO_BUTTON_NAME, fruit.id))
      .setLabel(truncate(fruit.name, DISCORD_BUTTON_LABEL_MAX_LENGTH))
      .setStyle(ButtonStyle.Primary),
  );
  return new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);
}

export function buildInfoEmbed(fruit: DevilFruitTemplate): EmbedBuilder {
  const embed = createOpEmbed()
    .setTitle(fruit.name)
    // TODO: Il faudrait que chaque fruit ait sa propre couleur plus tard (ajouter colonne color etc..)
    .addFields(
      {
        // TODO: Il faudrait que types prennent un S seulement si c'est au pluriel (plusieurs types)
        name: 'Types',
        value: fruit.types.length > 0 ? fruit.types.join(', ') : '—',
        inline: true,
      },
      // TODO: Il faut styliser ça et ajouter des emojis
      { name: 'HP', value: formatDfBonus(fruit.hpBonus), inline: true },
      { name: 'Combat', value: formatDfBonus(fruit.combatBonus), inline: true },
    );

  if (fruit.imageUrl) {
    embed.setThumbnail(buildAssetUrl(fruit.imageUrl));
  }

  return embed;
}

function formatDfBonus(value: number): string {
  return value >= 0 ? `+${value}` : String(value);
}
