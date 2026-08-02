import type { EmbedBuilder } from 'discord.js';

import { buildBerryObtainedEmbed, buildItemObtainedEmbed, buildOpEmbed } from '../../../discord/utils/index.js';
import type { FishingResult } from '../types.js';

export function buildFishingOutcomeEmbed(result: FishingResult): EmbedBuilder {
  switch (result.outcome) {
    case 'resource':
      return buildItemObtainedEmbed(result.resourceName, result.quantity);
    case 'berry':
      return buildBerryObtainedEmbed(result.amount);
    case 'nothing':
      return buildOpEmbed('default')
        .setTitle('🎣 Ligne remontée... vide.')
        .setDescription('Pas une touche cette fois. Retente ta chance plus tard.');
  }
}
