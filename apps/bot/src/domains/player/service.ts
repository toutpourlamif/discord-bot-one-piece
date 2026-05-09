import { db, type DbOrTransaction, type Player, type Zone } from '@one-piece/db';

import { ValidationError } from '../../discord/errors.js';
import { sanitizeName } from '../../shared/sanitize-name.js';
import * as characterRepository from '../character/repository.js';
import { getLatestProcessableBucket } from '../event/engine/bucket.js';
import * as eventRepository from '../event/repository.js';
import * as historyRepository from '../history/index.js';
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
  const latestProcessableBucketId = getLatestProcessableBucket();

  if (player.lastProcessedBucketId < latestProcessableBucketId) {
    return false;
  }

  const interactivePending = await eventRepository.findFirstInteractivePending(playerId);

  return interactivePending === null;
}

export async function recordZoneChange(playerId: number, newZone: Zone, bucketId: number, client: DbOrTransaction = db): Promise<void> {
  const currentPlayer = await playerRepository.findByIdOrThrow(playerId, client);
  const from = currentPlayer.currentZone;

  if (from === newZone) throw new ValidationError('Vous êtes déjà à cet endroit');

  await playerRepository.updateZone(playerId, newZone, client);
  await historyRepository.appendHistory({
    type: 'player.zone_changed',
    actorPlayerId: playerId,
    bucketId,
    payload: { from, to: newZone },
    client,
  });
}
