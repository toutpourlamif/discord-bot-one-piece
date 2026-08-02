import type { DbOrTransaction } from '@one-piece/db';

import * as economyRepository from '../../economy/repository.js';
import * as historyRepository from '../../history/index.js';
import * as resourceRepository from '../../resource/repository.js';
import type { FishingResult } from '../types.js';

export async function applyFishingOutcome(playerId: number, outcome: FishingResult, client: DbOrTransaction): Promise<void> {
  switch (outcome.outcome) {
    case 'resource':
      await resourceRepository.addResource({ playerId, name: outcome.resourceName, quantity: outcome.quantity, options: { client } });
      await historyRepository.appendHistory({
        type: 'fishing.attempt.resource',
        payload: { resourceName: outcome.resourceName, quantity: outcome.quantity },
        actorPlayerId: playerId,
        client,
      });
      return;
    case 'berry':
      await economyRepository.creditBerry(playerId, BigInt(outcome.amount), client);
      await historyRepository.appendHistory({
        type: 'fishing.attempt.berry',
        payload: { amount: outcome.amount },
        actorPlayerId: playerId,
        client,
      });
      return;
    case 'nothing':
      await historyRepository.appendHistory({
        type: 'fishing.attempt.nothing',
        payload: {},
        actorPlayerId: playerId,
        client,
      });
      return;
  }
}
