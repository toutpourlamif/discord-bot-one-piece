import sample from 'lodash/sample.js';

import * as historyRepository from '../history/index.js';
import * as resourceRepository from '../resource/repository.js';

export type FishingResult = { quantity: number; resourceName: string };

// TODO: pour l'instant c'est un tirage dans resource_template ;
//  en PROD, vrai système (loot pondéré, cooldown, events…) cf docs/domains/fishing.md.
export async function runFishingAttempt(playerId: number): Promise<FishingResult> {
  const templates = await resourceRepository.listAllTemplates();
  const picked = sample(templates);
  if (!picked) throw new Error('Aucun resource_template en base — exécute le seed avant de pêcher.');

  await resourceRepository.addResourceToPlayer(playerId, picked.id, 1);
  // TODO: SUPPRIMER EN PROD — log de test pour valider history
  await historyRepository.appendHistory({
    type: 'fishing.attempt',
    payload: {
      quantity: 1,
      resourceName: picked.name,
    },
    actorPlayerId: playerId,
  });
  return { quantity: 1, resourceName: picked.name };
}
