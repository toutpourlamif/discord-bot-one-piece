import type { EmbedBuilder } from 'discord.js';

import { NotFoundError } from '../../discord/errors.js';
import type { DomainName } from '../../shared/domains.js';

import type { InfoProvider } from './types.js';

type BuildInfoProviderInput<TSearch, TDetail> = {
  domain: DomainName;
  searchManyByName: (query: string) => Promise<Array<{ entity: TSearch; score: number }>>;
  findById: (id: number) => Promise<TDetail | undefined>;
  buildEmbed: (entity: TDetail) => EmbedBuilder;
};

export function buildInfoProvider<TSearch extends { id: number; name: string }, TDetail = TSearch>(
  input: BuildInfoProviderInput<TSearch, TDetail>,
): InfoProvider {
  return {
    domain: input.domain,
    async searchManyByName(query) {
      const rows = await input.searchManyByName(query);
      return rows.map((row) => ({
        domain: input.domain,
        id: row.entity.id,
        name: row.entity.name,
        score: row.score,
      }));
    },
    async buildEmbedById(id) {
      const entity = await input.findById(id);
      if (!entity) throw new NotFoundError("Ce résultat n'existe plus.");
      return input.buildEmbed(entity);
    },
  };
}
