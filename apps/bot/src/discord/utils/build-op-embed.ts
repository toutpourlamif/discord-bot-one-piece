import { EmbedBuilder } from 'discord.js';

import { BOT_NAME, botIconUrl, EMBED_COLORS, type EmbedVariant } from '../branding.js';

export function buildOpEmbed(variant: EmbedVariant = 'default', withAuthor = false): EmbedBuilder {
  const embed = new EmbedBuilder().setColor(EMBED_COLORS[variant]);
  if (withAuthor) {
    embed.setAuthor({ name: BOT_NAME, iconURL: botIconUrl });
  }
  return embed;
}
