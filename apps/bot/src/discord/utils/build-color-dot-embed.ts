import type { EmbedBuilder } from 'discord.js';

import { buildInvisibleIndent } from '../../shared/utils.js';
import { EMBED_COLORS, type EmbedVariant } from '../branding.js';

import { buildOpEmbed } from './build-op-embed.js';
import { convertJsHexToCssHex } from './convert-js-hex-to-css-hex.js';

// TODO: Mettre les couleurs en assets
/** Embed dont l'auteur est un simple rond de la couleur du variant — scene narrative sans branding du bot. Nom invisible par défaut. */
export function buildColorDotEmbed(variant: EmbedVariant = 'default', authorName: string = buildInvisibleIndent(1)): EmbedBuilder {
  const hex = convertJsHexToCssHex(EMBED_COLORS[variant]).slice(1);
  const iconURL = `https://dummyimage.com/500x500/${hex}/${hex}.png`;
  return buildOpEmbed(variant).setAuthor({ name: authorName, iconURL });
}
