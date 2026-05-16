import { pgEnum } from 'drizzle-orm/pg-core';

// TODO: liste non exhaustive, à compléter

export const characterSkillEnum = pgEnum('character_skill', ['MASON', 'SUPER_MASON', 'NAVIGATOR', 'CONQUERORS_HAKI', 'ARCHAEOLOGIST']);

export type Skill = (typeof characterSkillEnum.enumValues)[number];
