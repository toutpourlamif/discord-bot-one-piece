import { sql } from 'drizzle-orm';

import { pokemonType } from '../enums/pokemon-type-enum.js';

export function buildPokemonTypesColumn() {
  return {
    types: pokemonType('types')
      .array()
      .notNull()
      .default(sql`'{}'::pokemon_type[]`),
  };
}
