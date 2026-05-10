import { db, SEAS, type DbOrTransaction, type Island, type Player, type Sea, type Zone } from '@one-piece/db';

import { ValidationError } from '../../discord/errors.js';
import { sanitizeName } from '../../shared/sanitize-name.js';
import * as characterRepository from '../character/repository.js';
import { getLatestProcessableBucket, getNowBucketId } from '../event/engine/bucket.js';
import type { Rng } from '../event/engine/rng.js';
import * as eventRepository from '../event/repository.js';
import * as historyRepository from '../history/index.js';
import { ZONE_GRAPH } from '../navigation/world.js';
import * as resourceRepository from '../resource/repository.js';
import * as shipRepository from '../ship/repository.js';
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

export async function recordZoneChange(
  playerId: number,
  newZone: Zone,
  bucketId: number,
  client: DbOrTransaction = db,
  occurredAt?: Date,
): Promise<void> {
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
    occurredAt,
  });
}

type CompleteTravelInput = {
  playerId: number;
  intendedZone: Island;
  rng: Rng;
  client?: DbOrTransaction;
};

type CompleteTravelResult = {
  arrivedZone: Island;
  drifted: boolean;
};

export async function completeTravel(input: CompleteTravelInput): Promise<CompleteTravelResult> {
  const run = (transaction: DbOrTransaction) => completeTravelInTransaction(input, transaction);

  if (input.client === undefined || input.client === db) return db.transaction(run);

  return run(input.client);
}

async function completeTravelInTransaction(
  { playerId, intendedZone, rng }: CompleteTravelInput,
  transaction: DbOrTransaction,
): Promise<CompleteTravelResult> {
  const currentBucketId = getNowBucketId();
  const occurredAt = new Date();
  const player = await playerRepository.findByIdOrThrow(playerId, transaction, { forUpdate: true });

  if (player.travelTargetZone === null) throw new ValidationError("Aucun voyage n'est en cours.");
  if (player.travelTargetZone !== intendedZone) throw new ValidationError('La destination du voyage ne correspond pas.');
  if (player.travelStartedBucket === null) throw new ValidationError('Le voyage en cours est incomplet.');
  if (!isSea(player.currentZone)) throw new ValidationError("Le joueur n'est pas en mer.");

  const from = player.currentZone;
  const ship = await shipRepository.findByPlayerIdOrThrow(playerId, transaction, { forUpdate: true });
  const hasLogPose = await resourceRepository.hasResourceByName(playerId, 'Log Pose', transaction);
  const driftProbability = computeDriftProbability(ship.hp, hasLogPose);
  const driftRoll = rng.next();
  const driftCandidate = driftRoll > driftProbability ? null : pickDriftCandidate(from, intendedZone, rng);
  const arrivedZone = driftCandidate ?? intendedZone;
  const drifted = driftCandidate !== null;

  await playerRepository.clearTravel(playerId, transaction);
  await recordZoneChange(playerId, arrivedZone, currentBucketId, transaction, occurredAt);

  if (drifted) {
    await historyRepository.appendHistory({
      type: 'travel.drifted',
      actorPlayerId: playerId,
      bucketId: currentBucketId,
      payload: { from, intendedTo: intendedZone, actualTo: arrivedZone },
      client: transaction,
      occurredAt,
    });
  } else {
    await historyRepository.appendHistory({
      type: 'travel.arrived',
      actorPlayerId: playerId,
      bucketId: currentBucketId,
      payload: {
        from,
        to: arrivedZone,
        actualDurationBuckets: currentBucketId - player.travelStartedBucket,
      },
      client: transaction,
      occurredAt,
    });
  }

  return { arrivedZone, drifted };
}

function computeDriftProbability(shipHp: number, hasLogPose: boolean): number {
  return clamp(0.02 + (1 - shipHp / 100) * 0.3 + (hasLogPose ? 0 : 0.2), 0.02, 0.5);
}

function pickDriftCandidate(from: Sea, intendedZone: Island, rng: Rng): Island | null {
  const candidates = Array.from(new Set(ZONE_GRAPH.filter((edge) => edge.via === from && edge.to !== intendedZone).map((edge) => edge.to)));
  if (candidates.length === 0) return null;

  const index = Math.min(Math.floor(rng.next() * candidates.length), candidates.length - 1);
  return candidates[index]!;
}

function isSea(zone: Zone): zone is Sea {
  return (SEAS as ReadonlyArray<Zone>).includes(zone);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
