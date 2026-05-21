import type { DbOrTransaction } from '@one-piece/db';

import { ValidationError } from '../../../discord/errors.js';
import * as shipRepository from '../../ship/repository.js';
import { getCrewByPlayerId } from '../service.js';
import { getCrewCapacity } from '../utils/get-crew-capacity.js';

export async function assertCrewHasAvailableSlot(playerId: number, client: DbOrTransaction): Promise<void> {
  const ship = await shipRepository.findByPlayerIdOrThrow(playerId, client, { forUpdate: true });
  const crewSize = (await getCrewByPlayerId(playerId, client)).length;

  if (crewSize >= getCrewCapacity(ship)) {
    throw new ValidationError("Ton équipage est plein, débarque quelqu'un d'abord.");
  }
}
