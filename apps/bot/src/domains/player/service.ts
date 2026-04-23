import type { Player } from '@one-piece/db';

import { assertNameNotEmpty, assertNameWithinMaxLength, sanitizeName } from './name.js';
import * as playerRepository from './repository.js';

type FindOrCreateResult = { player: Player; created: boolean };

export async function findOrCreatePlayer(discordId: string, name: string): Promise<FindOrCreateResult> {
  const existing = await playerRepository.findByDiscordId(discordId);
  if (existing) return { player: existing, created: false };
  const created = await playerRepository.create(discordId, name);
  return { player: created, created: true };
}

export async function renamePlayer(discordId: string, fallbackName: string, rawName: string): Promise<Player> {
  const trimmedName = rawName.trim();
  assertNameNotEmpty(trimmedName);
  assertNameWithinMaxLength(trimmedName);

  const sanitizedName = sanitizeName(trimmedName);
  assertNameNotEmpty(sanitizedName);

  const { player } = await findOrCreatePlayer(discordId, fallbackName);
  return playerRepository.updateName(player.id, sanitizedName);
}
