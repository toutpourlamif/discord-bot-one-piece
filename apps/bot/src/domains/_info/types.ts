import type { EmbedBuilder } from 'discord.js';

import type { DomainName } from '../../shared/domains.js';

export type InfoSearchHit = {
  domain: DomainName;
  id: number;
  name: string;
  score: number;
};

export type InfoProvider = {
  domain: DomainName;
  searchManyByName(query: string): Promise<Array<InfoSearchHit>>;
  buildEmbedById(id: number): Promise<EmbedBuilder>;
};
