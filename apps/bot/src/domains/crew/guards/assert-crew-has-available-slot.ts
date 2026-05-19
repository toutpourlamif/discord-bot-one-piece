import type { DbOrTransaction } from '@one-piece/db';

import { ValidationError } from '../../../discord/errors.js';
import * as characterRepository from '../../character/repository.js';
import * as shipRepository from '../../ship/repository.js';
import { getCrewCapacity } from '../utils/get-crew-capacity.js';
import { isInCrewFilter } from '../utils/is-in-crew-filter.js';

export async function assertCrewHasAvailableSlot(playerId: number, client: DbOrTransaction): Promise<void> {
  const ship = await shipRepository.findByPlayerIdOrThrow(playerId, client, { forUpdate: true });
  const characters = await characterRepository.getCharactersByPlayerId(playerId, client);
  const crewSize = characters.filter(isInCrewFilter).length;

  if (crewSize >= getCrewCapacity(ship)) {
    throw new ValidationError("Ton équipage est plein, débarque quelqu'un d'abord.");
  }
}
