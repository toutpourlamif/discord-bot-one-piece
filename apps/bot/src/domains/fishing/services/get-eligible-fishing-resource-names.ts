import type { DbOrTransaction, ResourceName } from '@one-piece/db';

import { InternalError } from '../../../discord/errors.js';
import * as resourceRepository from '../../resource/repository.js';

export async function getEligibleFishingResourceNames(client: DbOrTransaction): Promise<Array<ResourceName>> {
  const templates = await resourceRepository.listNonQuestTemplates(client);
  if (templates.length === 0) {
    throw new InternalError('Aucun resource_template éligible au loot de pêche (isQuestItem=false) — vérifie le seed.');
  }
  return templates.map((template) => template.name);
}
