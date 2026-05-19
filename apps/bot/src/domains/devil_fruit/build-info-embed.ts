import type { DevilFruitTemplate } from '@one-piece/db';
import type { EmbedBuilder } from 'discord.js';

import { buildOpEmbed } from '../../discord/utils/index.js';
import { buildAssetUrl } from '../../shared/build-asset-url.js';
import { DOMAIN_EMOJI, DOMAIN_LABEL } from '../../shared/domains.js';

export function buildDevilFruitInfoEmbed(fruit: DevilFruitTemplate): EmbedBuilder {
  const embed = buildOpEmbed()
    .setTitle(fruit.name)
    .setFooter({ text: `${DOMAIN_EMOJI.devil_fruit} ${DOMAIN_LABEL.devil_fruit}` })
    // TODO: Il faudrait que chaque fruit ait sa propre couleur plus tard (ajouter colonne color etc..)
    .addFields(
      // TODO: Il faudrait que types prennent un S seulement si c'est au pluriel (plusieurs types)
      {
        name: 'Types',
        value: fruit.types.length > 0 ? fruit.types.join(', ') : '—',
        inline: true,
      },
      // TODO: Il faut styliser ça et ajouter des emojis
      { name: 'HP', value: formatDfBonus(fruit.hpBonus), inline: true },
      { name: 'Combat', value: formatDfBonus(fruit.combatBonus), inline: true },
    );

  if (fruit.imageUrl) {
    embed.setImage(buildAssetUrl(fruit.imageUrl));
  }

  return embed;
}

function formatDfBonus(value: number): string {
  return value >= 0 ? `+${value}` : String(value);
}
