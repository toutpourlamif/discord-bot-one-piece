import sample from 'lodash/sample.js';

import { addResourceToPlayer, listTemplates } from '../resource/repository.js';

export type FishingResult = { resourceName: string };

// TODO: pour l'instant c'est un tirage dans resource_template ;
//  en PROD, vrai système (loot pondéré, cooldown, events…) cf docs/domains/fishing.md.
export async function runFishingAttempt(playerId: number): Promise<FishingResult> {
  const templates = await listTemplates();
  const picked = sample(templates);
  if (!picked) throw new Error('Aucun resource_template en base — exécute le seed avant de pêcher.');

  await addResourceToPlayer(playerId, picked.id, 1);
  return { resourceName: picked.name };
}
