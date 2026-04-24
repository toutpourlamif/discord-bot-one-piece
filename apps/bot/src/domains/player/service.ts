import type { Player } from '@one-piece/db';

import { findOrCreateShip } from '../ship/service.js';

import * as playerRepository from './repository.js';

type FindOrCreateResult = { player: Player; created: boolean };

export async function findOrCreatePlayer(discordId: string, name: string): Promise<FindOrCreateResult> {
  const existing = await playerRepository.findByDiscordId(discordId);
  if (existing) return { player: existing, created: false };
  const created = await playerRepository.create(discordId, name);
  await findOrCreateShip(created.id);
  return { player: created, created: true };
}
