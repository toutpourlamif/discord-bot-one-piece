import { pgEnum } from 'drizzle-orm/pg-core';

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
]);
