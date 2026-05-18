import type { EmbedBuilder } from 'discord.js';

import { buildOpEmbed } from '../../discord/utils/index.js';
import { buildAssetUrl } from '../../shared/build-asset-url.js';
import { DOMAIN_EMOJI, DOMAIN_LABEL } from '../../shared/domains.js';

import type { CharacterTemplateInfo } from './types.js';
import { getEffectiveStats } from './utils/index.js';

// TODO: design de l'embed character à revoir (emojis, couleur, mise en forme HP/Combat)
export function buildCharacterInfoEmbed(template: CharacterTemplateInfo): EmbedBuilder {
  const stats = getEffectiveStats(template);

  const embed = buildOpEmbed()
    .setTitle(template.name)
    .setFooter({ text: `${DOMAIN_EMOJI.character} ${DOMAIN_LABEL.character}` })
    .addFields(
      { name: 'HP', value: formatEffectiveStat(stats.hp, template.devilFruit?.hpBonus ?? 0), inline: true },
      { name: 'Combat', value: formatEffectiveStat(stats.combat, template.devilFruit?.combatBonus ?? 0), inline: true },
      { name: 'Fruit du Démon', value: template.devilFruitName ?? '—', inline: true },
      { name: 'Types', value: formatTypes(template.devilFruitTypes), inline: true },
    );

  if (template.imageUrl) {
    embed.setImage(buildAssetUrl(template.imageUrl));
  }

  if (template.description !== null) {
    embed.setDescription(template.description);
  }

  return embed;
}

function formatTypes(types: Array<string> | null): string {
  if (!types || types.length === 0) return '—';
  return types.join(', ');
}

function formatEffectiveStat(value: number, devilFruitBonus: number): string {
  if (devilFruitBonus === 0) return String(value);

  return `${value} (${formatSignedBonus(devilFruitBonus)} grâce au fruit)`;
}

function formatSignedBonus(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}
