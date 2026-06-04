import type { EmbedBuilder } from 'discord.js';

import { buildAssetUrl } from '../../shared/build-asset-url.js';

import { buildOpEmbed } from './build-op-embed.js';

export function buildConsequenceEmbed(): EmbedBuilder {
  return buildOpEmbed('default').setImage(pickRandomGif()).setDescription('Cette décision aura des conséquences...');
}

// TODO: ajouter d'autres papillons quand on en aura
const CONSEQUENCE_GIFS: Array<string> = [buildAssetUrl('miscellaneous/butterfly-imu.webp')];

function pickRandomGif(): string {
  return CONSEQUENCE_GIFS[Math.floor(Math.random() * CONSEQUENCE_GIFS.length)]!;
}
