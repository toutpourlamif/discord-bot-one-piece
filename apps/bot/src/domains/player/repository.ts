import { db, player, type DbOrTransaction, type DrizzleTx, type Player, type Zone } from '@one-piece/db';
import { eq } from 'drizzle-orm';

import { NotFoundError } from '../../discord/errors.js';
import { bucketIdFromTimestamp } from '../event/engine/bucket.js';
import * as historyRepository from '../history/index.js';

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

type RecordZoneChangeInput = {
  playerId: number;
  newZone: Zone;
  at?: Date;
  tx?: DrizzleTx;
};

export async function recordZoneChange(input: RecordZoneChangeInput): Promise<void> {
  const run = async (tx: DrizzleTx) => {
    const at = input.at ?? new Date();
    const bucketId = bucketIdFromTimestamp(at);
    const [currentPlayer] = await tx
      .select({ currentZone: player.currentZone })
      .from(player)
      .where(eq(player.id, input.playerId))
      .limit(1)
      .for('update');

    if (!currentPlayer) {
      throw new NotFoundError('Joueur introuvable.');
    }

    const from = currentPlayer.currentZone;
    if (from === input.newZone) return;

    await tx.update(player).set({ currentZone: input.newZone }).where(eq(player.id, input.playerId));
    await historyRepository.appendHistory({
      type: 'player.zone_changed',
      actorPlayerId: input.playerId,
      bucketId,
      payload: { from, to: input.newZone },
      client: tx,
      occurredAt: at,
    });
  };

  if (input.tx) {
    await run(input.tx);
    return;
  }

  await db.transaction(run);
}
