import type { CharacterTemplate } from '@one-piece/db';
import type { EmbedBuilder } from 'discord.js';

import { buildOpEmbed } from '../../discord/utils/index.js';
import { buildAssetUrl } from '../../shared/build-asset-url.js';
import { DOMAIN_EMOJI, DOMAIN_LABEL } from '../../shared/domains.js';

// TODO: ajouter une colonne `description` à character_template (ticket à créer) puis la rendre ici via setDescription
// TODO: design de l'embed character à revoir (emojis, couleur, mise en forme HP/Combat)
export function buildCharacterInfoEmbed(template: CharacterTemplate): EmbedBuilder {
  const embed = buildOpEmbed()
    .setTitle(template.name)
    .setFooter({ text: `${DOMAIN_EMOJI.character} ${DOMAIN_LABEL.character}` })
    .addFields({ name: 'HP', value: String(template.hp), inline: true }, { name: 'Combat', value: String(template.combat), inline: true });

  if (template.imageUrl) {
    embed.setThumbnail(buildAssetUrl(template.imageUrl));
  }

  return embed;
}
