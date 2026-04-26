import { buildInfoProvider } from '../_info/build-provider.js';

import { buildResourceInfoEmbed } from './build-info-embed.js';
import { findById, searchManyByName } from './repository.js';

export const resourceInfoProvider = buildInfoProvider({
  domain: 'resource',
  searchManyByName,
  findById,
  buildEmbed: buildResourceInfoEmbed,
});
