import type { Player } from '@one-piece/db';

import { findOrCreateShip } from '../ship/service.js';

import { assertNameNotEmpty, assertNameWithinMaxLength, sanitizeName } from './name.js';
import * as playerRepository from './repository.js';

type FindOrCreateResult = { player: Player; created: boolean };

export async function findOrCreatePlayer(discordId: string, name: string): Promise<FindOrCreateResult> {
  const existing = await playerRepository.findByDiscordId(discordId);
  if (existing) return { player: existing, created: false };
  const created = await playerRepository.create(discordId, name);
  await findOrCreateShip(created.id);
  return { player: created, created: true };
}

export async function renamePlayer(playerId: number, rawName: string): Promise<Player> {
  const trimmedName = rawName.trim();
  assertNameWithinMaxLength(trimmedName);

  const sanitizedName = sanitizeName(trimmedName);
  assertNameNotEmpty(sanitizedName);

  return playerRepository.updateName(playerId, sanitizedName);
}
