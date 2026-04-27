import { db, ship, type Ship } from '@one-piece/db';
import { eq } from 'drizzle-orm';

export async function findByPlayerId(playerId: number): Promise<Ship | undefined> {
  const [row] = await db.select().from(ship).where(eq(ship.playerId, playerId)).limit(1);
  return row;
}

export async function findByPlayerIdOrThrow(playerId: number): Promise<Ship> {
  const row = await findByPlayerId(playerId);
  if (!row) throw new Error(`ship introuvable pour player: ${playerId}`);
  return row;
}

export async function create(playerId: number, name: string): Promise<Ship> {
  const [row] = await db.insert(ship).values({ playerId, name }).returning();
  return row!;
}

export async function rename(shipId: number, newName: string): Promise<Ship> {
  const [row] = await db.update(ship).set({ name: newName }).where(eq(ship.id, shipId)).returning();
  return row!;
}
