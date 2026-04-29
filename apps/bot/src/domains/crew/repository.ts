import { characterInstance, db, type DbOrTransaction } from '@one-piece/db';
import { and, eq, isNotNull } from 'drizzle-orm';

export async function findOwnerPlayerIdByInstanceId(instanceId: number): Promise<number | undefined> {
  const [row] = await db
    .select({ playerId: characterInstance.playerId })
    .from(characterInstance)
    .where(eq(characterInstance.id, instanceId))
    .limit(1);

  return row?.playerId;
}

export async function removeCaptain(playerId: number, client: DbOrTransaction): Promise<void> {
  await client
    .update(characterInstance)
    .set({ isCaptain: false })
    .where(and(eq(characterInstance.playerId, playerId), eq(characterInstance.isCaptain, true)));
}

export async function setCaptain(playerId: number, instanceId: number, client: DbOrTransaction): Promise<boolean> {
  const result = await client
    .update(characterInstance)
    .set({ isCaptain: true })
    .where(and(eq(characterInstance.id, instanceId), eq(characterInstance.playerId, playerId), isNotNull(characterInstance.joinedCrewAt)));

  return result.count > 0;
}
