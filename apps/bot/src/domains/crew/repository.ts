import { characterInstance, db } from '@one-piece/db';
import { and, eq, isNotNull } from 'drizzle-orm';

import { NotFoundError } from '../../discord/errors.js';

export async function setCaptain(playerId: number, instanceId: number): Promise<void> {
  await db.transaction(async (tx) => {
    await tx
      .update(characterInstance)
      .set({ isCaptain: false })
      .where(and(eq(characterInstance.playerId, playerId), eq(characterInstance.isCaptain, true)));

    const result = await tx
      .update(characterInstance)
      .set({ isCaptain: true })
      .where(
        and(eq(characterInstance.id, instanceId), eq(characterInstance.playerId, playerId), isNotNull(characterInstance.joinedCrewAt)),
      );

    if (result.count === 0) {
      throw new NotFoundError("Ce character n'est pas dans ton équipage.");
    }
  });
}
