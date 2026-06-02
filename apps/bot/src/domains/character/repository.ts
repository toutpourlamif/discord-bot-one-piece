import {
  characterInstance,
  characterTemplate,
  db,
  devilFruitTemplate,
  type CharacterInstance,
  type CharacterTemplate,
  type DbOrTransaction,
} from '@one-piece/db';
import { and, asc, desc, eq, getTableColumns, ilike, isNull, or, sql } from 'drizzle-orm';

import { InternalError } from '../../discord/errors.js';

import type { CharacterRow, CharacterTemplateWithDevilFruit } from './types.js';

//TODO: regarder si on peut select all ou pas
export async function getCharactersByPlayerId(playerId: number, client: DbOrTransaction = db): Promise<Array<CharacterRow>> {
  return client
    .select({
      instanceId: characterInstance.id,
      name: characterTemplate.name,
      nickname: characterInstance.nickname,
      imageUrl: characterTemplate.imageUrl,
      hp: characterTemplate.hp,
      combat: characterTemplate.combat,
      devilFruit: getTableColumns(devilFruitTemplate),
      joinedCrewAt: characterInstance.joinedCrewAt,
      isCaptain: characterInstance.isCaptain,
      captainCombatMultiplier: characterTemplate.captainCombatMultiplier,
      captainHpMultiplier: characterTemplate.captainHpMultiplier,
      captainBerryGainMultiplier: characterTemplate.captainBerryGainMultiplier,
      captainKarmaMultiplier: characterTemplate.captainKarmaMultiplier,
      captainMoraleMultiplier: characterTemplate.captainMoraleMultiplier,
    })
    .from(characterInstance)
    .innerJoin(characterTemplate, eq(characterInstance.templateId, characterTemplate.id))
    .leftJoin(
      devilFruitTemplate,
      eq(
        devilFruitTemplate.id,
        sql<number>`coalesce(${characterTemplate.devilFruitTemplateId}, ${characterInstance.devilFruitTemplateId})`,
      ),
    )
    .where(eq(characterInstance.playerId, playerId))
    .orderBy(desc(characterInstance.isCaptain), sql`${characterInstance.joinedCrewAt} asc nulls last`, asc(characterTemplate.name));
}

export async function findTemplateByName(name: string, client: DbOrTransaction = db): Promise<CharacterTemplate | undefined> {
  const [row] = await client.select().from(characterTemplate).where(eq(characterTemplate.name, name)).limit(1);
  return row;
}

// TODO: multi-statement → service avec tx
export async function createCharacterInstance(playerId: number, templateId: number, client: DbOrTransaction = db): Promise<CharacterRow> {
  const [created] = await client
    .insert(characterInstance)
    .values({
      playerId,
      templateId,
    })
    .returning();
  if (!created) throw new InternalError('Impossible de créer ce personnage.');

  const [createdRow] = await client
    .select({
      instanceId: characterInstance.id,
      name: characterTemplate.name,
      nickname: characterInstance.nickname,
      imageUrl: characterTemplate.imageUrl,
      hp: characterTemplate.hp,
      combat: characterTemplate.combat,
      devilFruit: getTableColumns(devilFruitTemplate),
      joinedCrewAt: characterInstance.joinedCrewAt,
      isCaptain: characterInstance.isCaptain,
      captainCombatMultiplier: characterTemplate.captainCombatMultiplier,
      captainHpMultiplier: characterTemplate.captainHpMultiplier,
      captainBerryGainMultiplier: characterTemplate.captainBerryGainMultiplier,
      captainKarmaMultiplier: characterTemplate.captainKarmaMultiplier,
      captainMoraleMultiplier: characterTemplate.captainMoraleMultiplier,
    })
    .from(characterInstance)
    .innerJoin(characterTemplate, eq(characterInstance.templateId, characterTemplate.id))
    .leftJoin(
      devilFruitTemplate,
      eq(
        devilFruitTemplate.id,
        sql<number>`coalesce(${characterTemplate.devilFruitTemplateId}, ${characterInstance.devilFruitTemplateId})`,
      ),
    )
    .where(eq(characterInstance.id, created.id))
    .limit(1);
  if (!createdRow) throw new InternalError('Impossible de récupérer le personnage créé.');

  return createdRow;
}

// Le filtre `player_id IS NULL` ne garde que les templates recrutables, qui ont toujours un nom : on resserre donc `name` en `string`.
export async function searchManyByName(query: string): Promise<Array<{ entity: CharacterTemplate & { name: string }; score: number }>> {
  const rows = await db
    .select({
      ...getTableColumns(characterTemplate),
      score: sql<number>`similarity(${characterTemplate.name}, ${query})`,
    })
    .from(characterTemplate)
    .where(
      and(or(sql`${characterTemplate.name} % ${query}`, ilike(characterTemplate.name, `%${query}%`)), isNull(characterTemplate.playerId)),
    )
    .orderBy(sql`similarity(${characterTemplate.name}, ${query}) desc`)
    .limit(25);
  return rows.map(({ score, ...entity }) => ({ entity: entity as CharacterTemplate & { name: string }, score }));
}

export async function findById(id: number): Promise<CharacterTemplateWithDevilFruit | undefined> {
  const [row] = await db
    .select({
      ...getTableColumns(characterTemplate),
      devilFruit: getTableColumns(devilFruitTemplate),
    })
    .from(characterTemplate)
    .leftJoin(devilFruitTemplate, eq(devilFruitTemplate.id, characterTemplate.devilFruitTemplateId))
    .where(eq(characterTemplate.id, id))
    .limit(1);
  return row;
}

// TODO: multi-statement → service avec tx
export async function createPlayerAsCharacterInstance(
  playerId: number,
  nickname: string,
  client: DbOrTransaction = db,
): Promise<CharacterInstance> {
  const [template] = await client
    .insert(characterTemplate)
    .values({
      name: null,
      playerId,
      race: 'HUMAN',
      hp: 10,
      combat: 10,
      imageUrl: null,
    })
    .returning();
  if (!template) throw new InternalError('Impossible de créer le template du joueur.');

  const [row] = await client
    .insert(characterInstance)
    .values({
      templateId: template.id,
      playerId,
      nickname,
      isCaptain: true,
      joinedCrewAt: new Date(),
    })
    .returning();
  return row!;
}

// TODO: multi-statement → service avec tx
export async function updatePlayerAsCharacterNickname(playerId: number, nickname: string, client: DbOrTransaction = db): Promise<void> {
  await client
    .update(characterInstance)
    .set({ nickname })
    .where(
      and(
        eq(characterInstance.playerId, playerId),
        eq(
          characterInstance.templateId,
          sql`(select ${characterTemplate.id} from ${characterTemplate} where ${characterTemplate.playerId} = ${playerId})`,
        ),
      ),
    );
}
