import type { EmbedBuilder } from 'discord.js';

import { buildColorDotEmbed } from './build-color-dot-embed.js';

// TODO: brancher l'icône réelle de l'item (resourceTemplate.imageUrl) une fois les assets prêts
const ITEM_OBTAINED_PLACEHOLDER_ICON_URL = 'https://placehold.co/256x256/2b2d31/ffffff.png?text=%3F';

/** Écran "objet obtenu" façon Zelda : author = rond success + "Vous avez obtenu : ", titre = "Nx item", icône de l'item en thumbnail. */
export function buildItemObtainedEmbed(itemName: string, quantity: number): EmbedBuilder {
  return buildColorDotEmbed('success', 'Vous avez obtenu : ')
    .setTitle(`${quantity}× ${itemName}`)
    .setThumbnail(ITEM_OBTAINED_PLACEHOLDER_ICON_URL);
}
