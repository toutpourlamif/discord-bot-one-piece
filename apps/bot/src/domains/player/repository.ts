import { db, player, type DbOrTransaction, type Player, type Zone } from '@one-piece/db';
import { eq } from 'drizzle-orm';

import { NotFoundError } from '../../discord/errors.js';
import { getNowBucketId } from '../event/engine/bucket.js';
import * as historyRepository from '../history/index.js';
import type { Edge } from '../navigation/world.js';

type FindByIdOptions = {
  forUpdate?: boolean;
};

type RecordZoneChangeInput = {
  playerId: number;
  newZone: Zone;
  bucketId?: number;
  at?: Date;
  client?: DbOrTransaction;
};

type StartTravelInput = {
  playerId: number;
  edge: Edge;
  etaBucket: number;
  client?: DbOrTransaction;
};

export async function findById(id: number, client: DbOrTransaction = db, options: FindByIdOptions = {}): Promise<Player | undefined> {
  if (options.forUpdate) {
    const [row] = await client.select().from(player).where(eq(player.id, id)).limit(1).for('update');
    return row;
  }

  const [row] = await client.select().from(player).where(eq(player.id, id)).limit(1);
  return row;
}

export async function findByIdOrThrow(id: number, client: DbOrTransaction = db, options: FindByIdOptions = {}): Promise<Player> {
  const row = await findById(id, client, options);
  if (!row) throw new NotFoundError('Joueur introuvable.');
  return row;
}

export async function findByDiscordId(discordId: string): Promise<Player | undefined> {
  const [row] = await db.select().from(player).where(eq(player.discordId, discordId)).limit(1);
  return row;
}

export async function create(discordId: string, name: string, originGuildId: string, transaction: DbOrTransaction = db): Promise<Player> {
  const lastProcessedBucketId = getNowBucketId();
  const [row] = await transaction.insert(player).values({ discordId, name, originGuildId, lastProcessedBucketId }).returning();
  return row!;
}

export async function updateName(playerId: number, name: string, client: DbOrTransaction = db): Promise<Player> {
  const [row] = await client.update(player).set({ name }).where(eq(player.id, playerId)).returning();
  return row!;
}

export async function updateZone(playerId: number, zone: Zone, client: DbOrTransaction = db): Promise<void> {
  await client.update(player).set({ currentZone: zone }).where(eq(player.id, playerId));
}

export async function recordZoneChange({
  playerId,
  newZone,
  bucketId = getNowBucketId(),
  at,
  client = db,
}: RecordZoneChangeInput): Promise<void> {
  const currentPlayer = await findByIdOrThrow(playerId, client);
  const from = currentPlayer.currentZone;

  await updateZone(playerId, newZone, client);
  await historyRepository.appendHistory({
    type: 'player.zone_changed',
    actorPlayerId: playerId,
    bucketId,
    payload: { from, to: newZone },
    client,
    occurredAt: at,
  });
}

async function persistTravel({ playerId, edge, etaBucket }: StartTravelInput, transaction: DbOrTransaction): Promise<void> {
  const travelStartedBucket = getNowBucketId();
  const occurredAt = new Date();

  await transaction
    .update(player)
    .set({
      travelTargetZone: edge.to,
      travelStartedBucket,
      travelEtaBucket: etaBucket,
    })
    .where(eq(player.id, playerId));

  await recordZoneChange({
    playerId,
    newZone: edge.via,
    bucketId: travelStartedBucket,
    at: occurredAt,
    client: transaction,
  });

  await historyRepository.writeEventResolution(
    {
      actorPlayerId: playerId,
      eventType: 'travel.departed',
      bucketId: travelStartedBucket,
      payload: { from: edge.from, to: edge.to, viaSea: edge.via, etaBucket },
    },
    transaction,
  );
}

export async function startTravel(input: StartTravelInput): Promise<void> {
  const client = input.client ?? db;

  if (client === db) {
    await db.transaction(async (transaction) => persistTravel(input, transaction));
    return;
  }

  await persistTravel(input, client);
}

export async function updateCrewName(playerId: number, crewName: string, client: DbOrTransaction = db): Promise<Player> {
  const [row] = await client.update(player).set({ crewName }).where(eq(player.id, playerId)).returning();
  return row!;
}

export async function setLastProcessedBucketId(playerId: number, bucketId: number, client: DbOrTransaction = db): Promise<void> {
  await client.update(player).set({ lastProcessedBucketId: bucketId }).where(eq(player.id, playerId));
}
