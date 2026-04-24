import type { Ship } from '@one-piece/db';

import * as shipRepository from './repository.js';

type FindOrCreateResult = { ship: Ship; created: boolean };

export async function findOrCreateShip(playerId: number, name = 'Navire sans nom'): Promise<FindOrCreateResult> {
  const existing = await shipRepository.findByPlayerId(playerId);
  if (existing) return { ship: existing, created: false };
  const created = await shipRepository.create(playerId, name);
  return { ship: created, created: true };
}
