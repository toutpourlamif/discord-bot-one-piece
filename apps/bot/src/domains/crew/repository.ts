import { characterInstance, db, type CharacterInstance, type DbOrTransaction } from '@one-piece/db';
import { and, eq, isNotNull } from 'drizzle-orm';

import { InternalError } from '../../discord/errors.js';

type FindCharacterInstanceByIdOptions = {
  forUpdate?: boolean;
};

export async function findCharacterInstanceById(
  instanceId: number,
  client: DbOrTransaction = db,
  options: FindCharacterInstanceByIdOptions = {},
): Promise<CharacterInstance | undefined> {
  const query = client.select().from(characterInstance).where(eq(characterInstance.id, instanceId)).limit(1);
  const [row] = await (options.forUpdate ? query.for('update') : query);
  return row;
}

export async function removeCaptain(playerId: number, client: DbOrTransaction): Promise<number> {
  const [previous] = await client
    .update(characterInstance)
    .set({ isCaptain: false })
    .where(and(eq(characterInstance.playerId, playerId), eq(characterInstance.isCaptain, true)))
    .returning({ id: characterInstance.id });

  if (!previous) throw new InternalError(`Le joueur ${playerId} n'a pas de capitaine actuel.`);
  return previous.id;
}

export async function setCaptain(playerId: number, instanceId: number, client: DbOrTransaction): Promise<boolean> {
  const result = await client
    .update(characterInstance)
    .set({ isCaptain: true })
    .where(and(eq(characterInstance.id, instanceId), eq(characterInstance.playerId, playerId), isNotNull(characterInstance.joinedCrewAt)));

  return result.count > 0;
}

export async function setCharacterJoinedAt(instanceId: number, joinedAt: Date | null, client: DbOrTransaction = db): Promise<void> {
  await client.update(characterInstance).set({ joinedCrewAt: joinedAt }).where(eq(characterInstance.id, instanceId));
}
