import { pgEnum } from 'drizzle-orm/pg-core';

// TODO: MAGMA, FOUDRE, LUMIERE, SABLE, GAZ et CAOUTCHOUC ne sont pas des types
// Pokémon — à supprimer ou remplacer par un vrai type. + traduire en anglais (vu que c'est un enum)
// Et renommer lef ichier en type-enum + le mettre dans shared vu que les character templates auront des types aussi
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
