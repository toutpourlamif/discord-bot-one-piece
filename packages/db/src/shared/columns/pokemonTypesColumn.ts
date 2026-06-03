import { sql } from 'drizzle-orm';

import { pokemonType } from '../enums/pokemon-type.js';

export function pokemonTypes() {
  return pokemonType('types')
    .array()
    .notNull()
    .default(sql`'{}'::pokemon_type[]`);
}
