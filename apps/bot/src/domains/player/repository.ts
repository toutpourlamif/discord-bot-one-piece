import { db, player, type DbOrTransaction, type Player, type Zone } from '@one-piece/db';
import { and, asc, eq, sql } from 'drizzle-orm';

import { NotFoundError } from '../../discord/errors.js';
import { getNowBucketId } from '../event/engine/bucket.js';

type FindByIdOptions = {
  forUpdate?: boolean;
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

export async function findManyByName(name: string, originGuildId: string, client: DbOrTransaction = db): Promise<Array<Player>> {
  return client
    .select()
    .from(player)
    .where(and(eq(player.originGuildId, originGuildId), sql`lower(${player.name}) = lower(${name})`))
    .orderBy(asc(player.id))
    .limit(5);
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
export async function updateCrewName(playerId: number, crewName: string, client: DbOrTransaction = db): Promise<Player> {
  const [row] = await client.update(player).set({ crewName }).where(eq(player.id, playerId)).returning();
  return row!;
}

export async function setLastProcessedBucketId(playerId: number, bucketId: number, client: DbOrTransaction = db): Promise<void> {
  await client.update(player).set({ lastProcessedBucketId: bucketId }).where(eq(player.id, playerId));
}
