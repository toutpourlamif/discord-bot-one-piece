import type { DbOrTransaction } from '@one-piece/db';

import { InsufficientResourceError } from './errors.js';
import * as resourceRepository from './repository.js';
import type { ResourceAmount } from './types.js';

export async function debitResourcesByName(playerId: number, resources: Array<ResourceAmount>, client: DbOrTransaction): Promise<void> {
  // TODO: Optimiser ça en batch.
  for (const { name, quantity } of resources) {
    const debited = await resourceRepository.debitResourceByName(playerId, name, quantity, client);
    if (!debited) {
      throw new InsufficientResourceError(name);
    }
  }
}
