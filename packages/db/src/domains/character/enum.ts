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

// TODO: liste non exhaustive, à compléter
export const characterSkillEnum = pgEnum('character_skill', ['MAÇON', 'SUPER MAÇON', 'NAVIGATEUR', 'HAKI DES ROIS', 'ARCHÉOLOGUE']);

export type Race = (typeof characterRaceEnum.enumValues)[number];
export type Skill = (typeof characterSkillEnum.enumValues)[number];
