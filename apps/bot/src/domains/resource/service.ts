import type { DbOrTransaction, ResourceName } from '@one-piece/db';

import { ValidationError } from '../../discord/errors.js';

import * as resourceRepository from './repository.js';

type ResourceCost = {
  name: ResourceName;
  quantity: number;
};

export async function debitResourcesByName(playerId: number, resources: Array<ResourceCost>, client: DbOrTransaction): Promise<void> {
  for (const { name, quantity } of resources) {
    const debited = await resourceRepository.debitResourceByName(playerId, name, quantity, client);
    if (!debited) {
      throw new ValidationError(`Ressource insuffisante : ${name}.`);
    }
  }
}
