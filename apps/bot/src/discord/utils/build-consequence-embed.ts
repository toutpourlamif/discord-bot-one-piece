import type { EmbedBuilder } from 'discord.js';
import sample from 'lodash/sample.js';

import { buildAssetUrl } from '../../shared/build-asset-url.js';

import { buildOpEmbed } from './build-op-embed.js';

export function buildConsequenceEmbed(): EmbedBuilder {
  return buildOpEmbed('default').setImage(sample(CONSEQUENCE_GIFS)!).setDescription('Cette décision aura des conséquences...');
}

// TODO: ajouter d'autres papillons quand on en aura
const CONSEQUENCE_GIFS: Array<string> = [buildAssetUrl('miscellaneous/butterfly-imu.webp')];
