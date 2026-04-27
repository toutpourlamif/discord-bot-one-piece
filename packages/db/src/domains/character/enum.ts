import { pgEnum } from 'drizzle-orm/pg-core';

// TODO: liste non exhaustive, à compléter
export const characterRaceEnum = pgEnum('character_race', [
  'HUMAN',
  'MINK',
  'FISHMAN',
  'GIANT',
  'LUNARIAN',
  'SKYPIEAN',
  'CYBORG',
  'MERMAID',
  'DWARF',
]);

export type Race = (typeof characterRaceEnum.enumValues)[number];
