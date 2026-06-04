import type { EmbedBuilder } from 'discord.js';

import { buildOpEmbed } from './build-op-embed.js';

export function buildConsequenceEmbed(): EmbedBuilder {
  return buildOpEmbed('default').setImage(pickRandomGif()).setDescription('Cette décision aura des conséquences...');
}

// TODO: remplacer par de vrais gifs de papillons (style Life is Strange)
const CONSEQUENCE_GIFS: Array<string> = [
  'https://example.com/butterflies-1.gif',
  'https://example.com/butterflies-2.gif',
  'https://example.com/butterflies-3.gif',
  'https://example.com/butterflies-4.gif',
];

function pickRandomGif(): string {
  return CONSEQUENCE_GIFS[Math.floor(Math.random() * CONSEQUENCE_GIFS.length)]!;
}
