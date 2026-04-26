import { buildInfoProvider } from '../_info/build-provider.js';

import { buildCharacterInfoEmbed } from './build-info-embed.js';
import { findById, searchManyByName } from './repository.js';

export const characterInfoProvider = buildInfoProvider({
  domain: 'character',
  searchManyByName,
  findById,
  buildEmbed: buildCharacterInfoEmbed,
});
