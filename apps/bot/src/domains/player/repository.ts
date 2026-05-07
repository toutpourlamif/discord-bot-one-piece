import { db, player, type DbOrTransaction, type Player } from '@one-piece/db';
import { eq } from 'drizzle-orm';

import { NotFoundError } from '../../discord/errors.js';

export async function findById(id: number): Promise<Player | undefined> {
  const [row] = await db.select().from(player).where(eq(player.id, id)).limit(1);
  return row;
}

export async function findByIdOrThrow(id: number): Promise<Player> {
  const row = await findById(id);
  if (!row) throw new NotFoundError('Joueur introuvable.');
  return row;
}

export async function findByDiscordId(discordId: string): Promise<Player | undefined> {
  const [row] = await db.select().from(player).where(eq(player.discordId, discordId)).limit(1);
  return row;
}

// TODO: remplacer par bucketIdFromTimestamp (#174) une fois mergé
const BUCKET_DURATION_SECONDS = 15 * 60;

export async function create(discordId: string, name: string, originGuildId: string, transaction: DbOrTransaction = db): Promise<Player> {
  const lastProcessedBucketId = Math.floor(Date.now() / 1000 / BUCKET_DURATION_SECONDS);
  const [row] = await transaction.insert(player).values({ discordId, name, originGuildId, lastProcessedBucketId }).returning();
  return row!;
}

export async function updateName(playerId: number, name: string, client: DbOrTransaction = db): Promise<Player> {
  const [row] = await client.update(player).set({ name }).where(eq(player.id, playerId)).returning();
  return row!;
}

export async function setLastProcessedBucketId(playerId: number, bucketId: number, client: DbOrTransaction = db): Promise<void> {
  await client.update(player).set({ lastProcessedBucketId: bucketId }).where(eq(player.id, playerId));
}
