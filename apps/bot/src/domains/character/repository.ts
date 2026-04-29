import { characterInstance, characterTemplate, db, type CharacterTemplate } from '@one-piece/db';
import { asc, desc, eq, getTableColumns, ilike, or, sql } from 'drizzle-orm';

import type { CharacterRow } from './types.js';

export async function getCharactersByPlayerId(playerId: number): Promise<Array<CharacterRow>> {
  return db
    .select({
      instanceId: characterInstance.id,
      name: characterTemplate.name,
      hp: characterTemplate.hp,
      combat: characterTemplate.combat,
      joinedCrewAt: characterInstance.joinedCrewAt,
      isCaptain: characterInstance.isCaptain,
    })
    .from(characterInstance)
    .innerJoin(characterTemplate, eq(characterInstance.templateId, characterTemplate.id))
    .where(eq(characterInstance.playerId, playerId))
    .orderBy(desc(characterInstance.isCaptain), sql`${characterInstance.joinedCrewAt} asc nulls last`, asc(characterTemplate.name));
}

export async function searchManyByName(query: string): Promise<Array<{ entity: CharacterTemplate; score: number }>> {
  const rows = await db
    .select({
      ...getTableColumns(characterTemplate),
      score: sql<number>`similarity(${characterTemplate.name}, ${query})`,
    })
    .from(characterTemplate)
    .where(or(sql`${characterTemplate.name} % ${query}`, ilike(characterTemplate.name, `%${query}%`)))
    .orderBy(sql`similarity(${characterTemplate.name}, ${query}) desc`)
    .limit(25);
  return rows.map(({ score, ...entity }) => ({ entity, score }));
}

export async function findById(id: number): Promise<CharacterTemplate | undefined> {
  const [row] = await db.select().from(characterTemplate).where(eq(characterTemplate.id, id)).limit(1);
  return row;
}
