import { EmbedBuilder } from 'discord.js';

import { BOT_COLOR, BOT_NAME, botIconUrl } from '../branding.js';

export function buildOpEmbed(): EmbedBuilder {
  return new EmbedBuilder().setColor(BOT_COLOR).setAuthor({ name: BOT_NAME, iconURL: botIconUrl });
}
