import { db, type DbOrTransaction } from '@one-piece/db';
import sample from 'lodash/sample.js';

import * as historyRepository from '../history/index.js';
import * as resourceRepository from '../resource/repository.js';

export type FishingResult = { quantity: number; resourceName: string };

// TODO: pour l'instant c'est un tirage dans resource_template ;
//  en PROD, vrai système (loot pondéré, cooldown, events…) cf docs/domains/fishing.md.
export async function runFishingAttempt(playerId: number, client: DbOrTransaction = db): Promise<FishingResult> {
  const templates = await resourceRepository.listAllTemplates();
  const picked = sample(templates);
  if (!picked) throw new Error('Aucun resource_template en base — exécute le seed avant de pêcher.');

  await resourceRepository.addResource({ playerId, name: picked.name, quantity: 1, options: { client } });
  // TODO: SUPPRIMER EN PROD — log de test pour valider history
  await historyRepository.appendHistory({
    type: 'fishing.attempt',
    payload: {
      quantity: 1,
      resourceName: picked.name,
    },
    actorPlayerId: playerId,
    client,
  });
  return { quantity: 1, resourceName: picked.name };
}
