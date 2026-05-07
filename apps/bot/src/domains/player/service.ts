import { db, type DbOrTransaction, type Player, type Zone } from '@one-piece/db';

import { sanitizeName } from '../../shared/sanitize-name.js';
import * as characterRepository from '../character/repository.js';
import { bucketIdFromTimestamp } from '../event/engine/bucket.js';
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

type RecordZoneChangeInput = {
  playerId: number;
  newZone: Zone;
  at?: Date;
  client?: DbOrTransaction;
};

async function recordZoneChangeWithClient(input: RecordZoneChangeInput, client: DbOrTransaction): Promise<void> {
  const at = input.at ?? new Date();
  const bucketId = bucketIdFromTimestamp(at);
  const currentPlayer = await playerRepository.findByIdOrThrow(input.playerId, client);
  const from = currentPlayer.currentZone;

  if (from === input.newZone) return;

  await playerRepository.updateZone(input.playerId, input.newZone, client);
  await historyRepository.appendHistory({
    type: 'player.zone_changed',
    actorPlayerId: input.playerId,
    bucketId,
    payload: { from, to: input.newZone },
    client,
    occurredAt: at,
  });
}

export async function recordZoneChange(input: RecordZoneChangeInput): Promise<void> {
  if (input.client) {
    await recordZoneChangeWithClient(input, input.client);
    return;
  }

  await db.transaction(async (transaction) => recordZoneChangeWithClient(input, transaction));
}
