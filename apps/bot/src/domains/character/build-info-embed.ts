import type { EmbedBuilder } from 'discord.js';

import { buildOpEmbed } from '../../discord/utils/index.js';
import { buildAssetUrl } from '../../shared/build-asset-url.js';
import { DOMAIN_EMOJI, DOMAIN_LABEL } from '../../shared/domains.js';

import type { CharacterTemplateWithDevilFruit } from './types.js';
import { getEffectiveStats } from './utils/index.js';

// TODO: design de l'embed character à revoir (emojis, couleur, mise en forme HP/Combat)
export function buildCharacterInfoEmbed(template: CharacterTemplateWithDevilFruit): EmbedBuilder {
  const stats = getEffectiveStats(template);
  const types = Array.from(new Set([...template.types, ...(template.devilFruit?.types ?? [])]));

  const embed = buildOpEmbed()
    .setTitle(template.name)
    .setFooter({ text: `${DOMAIN_EMOJI.character} ${DOMAIN_LABEL.character}` })
    .addFields(
      { name: 'HP', value: String(stats.hp), inline: true },
      { name: 'Combat', value: String(stats.combat), inline: true },
      { name: 'Fruit du Démon', value: template.devilFruit?.name ?? '—', inline: true },
      { name: 'Types', value: formatTypes(types), inline: true },
    );

  if (template.imageUrl) {
    embed.setImage(buildAssetUrl(template.imageUrl));
  }

  if (template.description !== null) {
    embed.setDescription(template.description);
  }

  return embed;
}

function formatTypes(types: Array<string>): string {
  if (types.length === 0) return '—';
  return types.join(', ');
}
