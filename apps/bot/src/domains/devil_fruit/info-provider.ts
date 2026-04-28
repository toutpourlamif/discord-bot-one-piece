import { buildInfoProvider } from '../_info/build-provider.js';

import { buildDevilFruitInfoEmbed } from './build-info-embed.js';
import { findById, searchManyByName } from './repository.js';

export const devilFruitInfoProvider = buildInfoProvider({
  domain: 'devil_fruit',
  searchManyByName,
  findById,
  buildEmbed: buildDevilFruitInfoEmbed,
});
