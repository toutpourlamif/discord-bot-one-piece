import { characterInstance, db, type CharacterInstance, type DbOrTransaction } from '@one-piece/db';
import { and, eq, isNotNull } from 'drizzle-orm';

export async function findCharacterInstanceById(instanceId: number): Promise<CharacterInstance | undefined> {
  const [row] = await db.select().from(characterInstance).where(eq(characterInstance.id, instanceId)).limit(1);
  return row;
}

export async function removeCaptain(playerId: number, client: DbOrTransaction): Promise<number | null> {
  const [previous] = await client
    .update(characterInstance)
    .set({ isCaptain: false })
    .where(and(eq(characterInstance.playerId, playerId), eq(characterInstance.isCaptain, true)))
    .returning({ id: characterInstance.id });

  return previous?.id ?? null;
}

export async function setCaptain(playerId: number, instanceId: number, client: DbOrTransaction): Promise<boolean> {
  const result = await client
    .update(characterInstance)
    .set({ isCaptain: true })
    .where(and(eq(characterInstance.id, instanceId), eq(characterInstance.playerId, playerId), isNotNull(characterInstance.joinedCrewAt)));

  return result.count > 0;
}
