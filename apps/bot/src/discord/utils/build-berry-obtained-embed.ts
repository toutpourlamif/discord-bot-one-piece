import type { EmbedBuilder } from 'discord.js';

import { formatBerry } from '../../domains/economy/index.js';

import { buildColorDotEmbed } from './build-color-dot-embed.js';

/** Écran "objet obtenu" façon Zelda, variante Berry : author = rond success + "Vous avez obtenu : ", titre = montant formaté. */
export function buildBerryObtainedEmbed(amount: bigint | number): EmbedBuilder {
  return buildColorDotEmbed('success', 'Vous avez obtenu : ').setTitle(formatBerry(amount));
}
