import type { DevilFruitTemplate } from '@one-piece/db';
import { EmbedBuilder } from 'discord.js';

import { buildAssetUrl } from '../../shared/assets.js';

import * as devilFruitRepository from './repository.js';

export async function findDevilFruits(query: string): Promise<Array<DevilFruitTemplate>> {
  return devilFruitRepository.searchByName(query);
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
      { name: 'HP', value: formatBonus(fruit.hpBonus), inline: true },
      { name: 'Combat', value: formatBonus(fruit.combatBonus), inline: true },
    );

  if (fruit.imageUrl) {
    console.log("voici l'image url : ", fruit.imageUrl, buildAssetUrl(fruit.imageUrl));
    embed.setThumbnail(buildAssetUrl(fruit.imageUrl));
  }

  return embed;
}

function formatBonus(value: number): string {
  return value >= 0 ? `+${value}` : String(value);
}
