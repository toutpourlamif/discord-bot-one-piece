import { db, type DbOrTransaction, type Ship } from '@one-piece/db';

import * as shipRepository from '../repository.js';
import { DEFAULT_SHIP_TEMPLATE_KEY } from '../templates.js';
import { buildShipTemplateState } from '../utils/index.js';

type FindOrCreateResult = { ship: Ship; created: boolean };

export async function findOrCreateShip(playerId: number, client: DbOrTransaction = db): Promise<FindOrCreateResult> {
  const existing = await shipRepository.findByPlayerId(playerId, client);
  if (existing) return { ship: existing, created: false };
  const created = await shipRepository.create(playerId, buildShipTemplateState(DEFAULT_SHIP_TEMPLATE_KEY), client);
  return { ship: created, created: true };
}
