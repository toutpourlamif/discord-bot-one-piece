import { db } from '@one-piece/db';

import { ValidationError } from '../../../discord/errors.js';
import * as characterRepository from '../../character/repository.js';
import * as shipRepository from '../../ship/repository.js';
import { assertCharacterExistsAndBelongsToPlayer, assertCharacterIsNotAlreadyInCrew } from '../guards/index.js';
import * as crewRepository from '../repository.js';
import { getCrewCapacity } from '../utils/get-crew-capacity.js';
import { isInCrewFilter } from '../utils/is-in-crew-filter.js';

export async function embarkCharacter(playerId: number, instanceId: number): Promise<void> {
  await db.transaction(async (transaction) => {
    const character = await crewRepository.findCharacterInstanceById(instanceId, transaction, { forUpdate: true });
    assertCharacterExistsAndBelongsToPlayer(character, playerId);
    assertCharacterIsNotAlreadyInCrew(character);

    const ship = await shipRepository.findByPlayerIdOrThrow(playerId, transaction, { forUpdate: true });
    const characters = await characterRepository.getCharactersByPlayerId(playerId, transaction);
    const crewSize = characters.filter(isInCrewFilter).length;
    if (crewSize >= getCrewCapacity(ship)) {
      throw new ValidationError("Ton équipage est plein, débarque quelqu'un d'abord.");
    }

    await crewRepository.setCharacterJoinedAt(instanceId, new Date(), transaction);
  });
}
