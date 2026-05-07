import { db, player, type DbOrTransaction, type Player } from '@one-piece/db';
import { eq } from 'drizzle-orm';

import { NotFoundError } from '../../discord/errors.js';
import { bucketIdFromTimestamp } from '../event/engine/bucket.js';
import * as eventRepository from '../event/repository.js';

export async function findById(id: number): Promise<Player | undefined> {
  const [row] = await db.select().from(player).where(eq(player.id, id)).limit(1);
  return row;
}

export async function findByIdOrThrow(id: number): Promise<Player> {
  const row = await findById(id);
  if (!row) throw new NotFoundError('Joueur introuvable.');
  return row;
}

export async function isPlayerCaughtUp(playerId: number): Promise<boolean> {
  const row = await findByIdOrThrow(playerId);
  const lastCompleteBucketId = bucketIdFromTimestamp(new Date()) - 1;

  if (row.lastProcessedBucketId < lastCompleteBucketId) {
    return false;
  }

  const interactivePending = await eventRepository.findFirstInteractivePending(playerId);

  return interactivePending === null;
}

export async function findByDiscordId(discordId: string): Promise<Player | undefined> {
  const [row] = await db.select().from(player).where(eq(player.discordId, discordId)).limit(1);
  return row;
}

export async function create(discordId: string, name: string, originGuildId: string, transaction: DbOrTransaction = db): Promise<Player> {
  const lastProcessedBucketId = bucketIdFromTimestamp(new Date());
  const [row] = await transaction.insert(player).values({ discordId, name, originGuildId, lastProcessedBucketId }).returning();
  return row!;
}

export async function updateName(playerId: number, name: string, client: DbOrTransaction = db): Promise<Player> {
  const [row] = await client.update(player).set({ name }).where(eq(player.id, playerId)).returning();
  return row!;
}

export async function updateCrewName(playerId: number, crewName: string, client: DbOrTransaction = db): Promise<Player> {
  const [row] = await client.update(player).set({ crewName }).where(eq(player.id, playerId)).returning();
  return row!;
}

export async function setLastProcessedBucketId(playerId: number, bucketId: number, client: DbOrTransaction = db): Promise<void> {
  await client.update(player).set({ lastProcessedBucketId: bucketId }).where(eq(player.id, playerId));
}
