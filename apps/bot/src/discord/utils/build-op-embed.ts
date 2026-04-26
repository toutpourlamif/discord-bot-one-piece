import { EmbedBuilder } from 'discord.js';

import { BOT_NAME, botIconUrl, EMBED_COLORS, type EmbedVariant } from '../branding.js';

export function buildOpEmbed(variant: EmbedVariant = 'default'): EmbedBuilder {
  return new EmbedBuilder().setColor(EMBED_COLORS[variant]).setAuthor({ name: BOT_NAME, iconURL: botIconUrl });
}
