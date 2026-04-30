import {
  characterInstance,
  characterTemplate,
  db,
  devilFruitTemplate,
  PLAYER_AS_CHARACTER_TEMPLATE_NAME,
  type CharacterInstance,
  type CharacterTemplate,
  type DbOrTransaction,
} from '@one-piece/db';
import { and, asc, desc, eq, getTableColumns, ilike, ne, or, sql } from 'drizzle-orm';

import { InternalError, NotFoundError } from '../../discord/errors.js';

import type { CharacterRow, CharacterTemplateInfo } from './types.js';

export async function getCharactersByPlayerId(playerId: number): Promise<Array<CharacterRow>> {
  return db
    .select({
      instanceId: characterInstance.id,
      name: characterTemplate.name,
      nickname: characterInstance.nickname,
      imageUrl: characterTemplate.imageUrl,
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

export async function createCharacterInstance(playerId: number, templateId: number): Promise<CharacterRow> {
  const [created] = await db
    .insert(characterInstance)
    .values({
      playerId,
      templateId,
    })
    .returning();
  if (!created) throw new InternalError('Impossible de créer ce personnage.');

  const [createdRow] = await db
    .select({
      instanceId: characterInstance.id,
      name: characterTemplate.name,
      nickname: characterInstance.nickname,
      imageUrl: characterTemplate.imageUrl,
      hp: characterTemplate.hp,
      combat: characterTemplate.combat,
      joinedCrewAt: characterInstance.joinedCrewAt,
      isCaptain: characterInstance.isCaptain,
    })
    .from(characterInstance)
    .innerJoin(characterTemplate, eq(characterInstance.templateId, characterTemplate.id))
    .where(eq(characterInstance.id, created.id))
    .limit(1);
  if (!createdRow) throw new InternalError('Impossible de récupérer le personnage créé.');

  return createdRow;
}

export async function searchManyByName(query: string): Promise<Array<{ entity: CharacterTemplate; score: number }>> {
  const rows = await db
    .select({
      ...getTableColumns(characterTemplate),
      score: sql<number>`similarity(${characterTemplate.name}, ${query})`,
    })
    .from(characterTemplate)
    .where(
      and(
        or(sql`${characterTemplate.name} % ${query}`, ilike(characterTemplate.name, `%${query}%`)),
        ne(characterTemplate.name, PLAYER_AS_CHARACTER_TEMPLATE_NAME),
      ),
    )
    .orderBy(sql`similarity(${characterTemplate.name}, ${query}) desc`)
    .limit(25);
  return rows.map(({ score, ...entity }) => ({ entity, score }));
}

export async function findById(id: number): Promise<CharacterTemplateInfo | undefined> {
  const [row] = await db
    .select({
      ...getTableColumns(characterTemplate),
      devilFruitName: devilFruitTemplate.name,
      devilFruitTypes: devilFruitTemplate.types,
    })
    .from(characterTemplate)
    .leftJoin(devilFruitTemplate, eq(devilFruitTemplate.id, characterTemplate.devilFruitTemplateId))
    .where(eq(characterTemplate.id, id))
    .limit(1);
  return row;
}

export async function getPlayerAsCharacterTemplate(): Promise<CharacterTemplate> {
  const [row] = await db.select().from(characterTemplate).where(eq(characterTemplate.name, PLAYER_AS_CHARACTER_TEMPLATE_NAME)).limit(1);
  if (!row) throw new NotFoundError(`Template ${PLAYER_AS_CHARACTER_TEMPLATE_NAME} introuvable — exécute le seed.`);
  return row;
}

export async function createPlayerAsCharacterInstance(
  playerId: number,
  nickname: string,
  client: DbOrTransaction = db,
): Promise<CharacterInstance> {
  const playerAsCharacterTemplate = await getPlayerAsCharacterTemplate();
  const [row] = await client
    .insert(characterInstance)
    .values({
      templateId: playerAsCharacterTemplate.id,
      playerId,
      nickname,
      isCaptain: true,
      joinedCrewAt: new Date(),
    })
    .returning();
  return row!;
}

export async function updatePlayerAsCharacterNickname(playerId: number, nickname: string, client: DbOrTransaction = db): Promise<void> {
  const playerAsCharacterTemplate = await getPlayerAsCharacterTemplate();
  await client
    .update(characterInstance)
    .set({ nickname })
    .where(and(eq(characterInstance.playerId, playerId), eq(characterInstance.templateId, playerAsCharacterTemplate.id)));
}
