import type { ResourceTemplate } from '@one-piece/db';
import type { EmbedBuilder } from 'discord.js';

import { buildOpEmbed } from '../../discord/utils/build-op-embed.js';
import { buildAssetUrl } from '../../shared/build-asset-url.js';

export function buildResourceInfoEmbed(template: ResourceTemplate): EmbedBuilder {
  const embed = buildOpEmbed().setTitle(template.name);

  if (template.description) {
    embed.setDescription(template.description);
  }

  if (template.imageUrl) {
    embed.setThumbnail(buildAssetUrl(template.imageUrl));
  }

  return embed;
}
