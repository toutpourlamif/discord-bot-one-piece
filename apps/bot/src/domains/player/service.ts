import { db, type Player } from '@one-piece/db';

import { sanitizeName } from '../../shared/sanitize-name.js';
import * as characterRepository from '../character/repository.js';
import { bucketIdFromTimestamp } from '../event/engine/bucket.js';
import * as eventRepository from '../event/repository.js';
import { findOrCreateShip } from '../ship/service.js';

import { assertNameNotEmpty, assertNameWithinMaxLength } from './guards/index.js';
import * as playerRepository from './repository.js';

type FindOrCreateResult = {
  player: Player;
  created: boolean;
};

export async function findOrCreatePlayer(discordId: string, name: string, guildId: string): Promise<FindOrCreateResult> {
  const existing = await playerRepository.findByDiscordId(discordId);
  if (existing) return { player: existing, created: false };

  const created = await db.transaction(async (transaction) => {
    const newPlayer = await playerRepository.create(discordId, name, guildId, transaction);
    await characterRepository.createPlayerAsCharacterInstance(newPlayer.id, newPlayer.name, transaction);
    await findOrCreateShip(newPlayer.id, undefined, transaction);
    return newPlayer;
  });

  return { player: created, created: true };
}

export async function renamePlayer(playerId: number, rawName: string): Promise<Player> {
  const trimmedName = rawName.trim();
  assertNameWithinMaxLength(trimmedName);

  const sanitizedName = sanitizeName(trimmedName);
  assertNameNotEmpty(sanitizedName);

  return db.transaction(async (transaction) => {
    const updated = await playerRepository.updateName(playerId, sanitizedName, transaction);
    await characterRepository.updatePlayerAsCharacterNickname(playerId, sanitizedName, transaction);
    return updated;
  });
}

export async function isPlayerUpToDate(playerId: number): Promise<boolean> {
  const player = await playerRepository.findByIdOrThrow(playerId);
  const lastCompleteBucketId = bucketIdFromTimestamp(new Date()) - 1;

  if (player.lastProcessedBucketId < lastCompleteBucketId) {
    return false;
  }

  const interactivePending = await eventRepository.findFirstInteractivePending(playerId);

  return interactivePending === null;
}
