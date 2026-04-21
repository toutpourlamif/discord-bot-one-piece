import type { DevilFruitTemplate } from '@one-piece/db';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';

import { buildAssetUrl } from '../../shared/assets.js';
import { DISCORD_BUTTON_LABEL_MAX_LENGTH } from '../../shared/constants.js';
import { truncate } from '../../shared/helpers.js';

export const INFO_CUSTOM_ID_PREFIX = 'info:devil_fruit:';

export function buildDisambiguationRow(fruits: Array<DevilFruitTemplate>): ActionRowBuilder<ButtonBuilder> {
  const buttons = fruits.map((fruit) =>
    new ButtonBuilder()
      .setCustomId(`${INFO_CUSTOM_ID_PREFIX}${fruit.id}`)
      .setLabel(truncate(fruit.name, DISCORD_BUTTON_LABEL_MAX_LENGTH))
      .setStyle(ButtonStyle.Primary),
  );
  return new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);
}

export function buildInfoEmbed(fruit: DevilFruitTemplate): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle(fruit.name)
    // TODO: Il faudrait que chaque fruit ait sa propre couleur plus tard (ajouter colonne color etc..)
    .setColor(0x5865f2)
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
    console.log("voici l'image url : ", fruit.imageUrl, buildAssetUrl(fruit.imageUrl));
    embed.setThumbnail(buildAssetUrl(fruit.imageUrl));
  }

  return embed;
}

function formatDfBonus(value: number): string {
  return value >= 0 ? `+${value}` : String(value);
}
