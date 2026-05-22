import { pgEnum } from 'drizzle-orm/pg-core';

// TODO: MAGMA, FOUDRE, LUMIERE, SABLE, GAZ et CAOUTCHOUC ne sont pas des types
// Pokémon — à supprimer ou remplacer par un vrai type.
export const devilFruitType = pgEnum('devil_fruit_type', [
  'FEU',
  'GLACE',
  'MAGMA',
  'FOUDRE',
  'TENEBRES',
  'LUMIERE',
  'SABLE',
  'GAZ',
  'CAOUTCHOUC',
  'POISON',
  'ACIER',
  'ELECTRIQUE',
  'PSY',
]);
