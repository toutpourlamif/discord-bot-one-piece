import { db } from '@one-piece/db';

import { assertCharacterExistsAndBelongsToPlayer, assertCharacterIsNotAlreadyInCrew, assertCrewHasAvailableSlot } from '../guards/index.js';
import * as crewRepository from '../repository.js';

export async function embarkCharacter(playerId: number, instanceId: number): Promise<void> {
  await db.transaction(async (transaction) => {
    const character = await crewRepository.findCharacterInstanceById(instanceId, transaction, { forUpdate: true });
    assertCharacterExistsAndBelongsToPlayer(character, playerId);
    assertCharacterIsNotAlreadyInCrew(character);
    await assertCrewHasAvailableSlot(playerId, transaction);

    await crewRepository.setCharacterJoinedAt(instanceId, new Date(), transaction);
  });
}
