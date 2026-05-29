import type { EmbedBuilder } from 'discord.js';

import { buildOpEmbed } from '../../../discord/utils/index.js';

export function buildAfterFishEmbed(): EmbedBuilder {
  return buildOpEmbed('info')
    .setTitle('Tu sais pêcher.')
    .setDescription("Un poisson dans le ventre, l'horizon devant. La suite, tu l'écriras toi-même.");
}
