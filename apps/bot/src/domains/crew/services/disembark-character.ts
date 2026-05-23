import { db } from '@one-piece/db';

import { assertCharacterExistsAndBelongsToPlayer, assertCharacterIsInCrew, assertCharacterIsNotCaptain } from '../guards/index.js';
import * as crewRepository from '../repository.js';

export async function disembarkCharacter(playerId: number, instanceId: number): Promise<void> {
  await db.transaction(async (transaction) => {
    const character = await crewRepository.findCharacterInstanceById(instanceId, transaction, { forUpdate: true });
    assertCharacterExistsAndBelongsToPlayer(character, playerId);
    assertCharacterIsInCrew(character);
    assertCharacterIsNotCaptain(character);

    await crewRepository.setCharacterJoinedAt(instanceId, null, transaction);
  });
}
