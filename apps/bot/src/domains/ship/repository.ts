import type { DbOrTransaction } from '@one-piece/db';
import { db, ship, type Ship } from '@one-piece/db';
import { eq } from 'drizzle-orm';

export async function findByPlayerId(playerId: number, client: DbOrTransaction = db): Promise<Ship | undefined> {
  const [row] = await client.select().from(ship).where(eq(ship.playerId, playerId)).limit(1);
  return row;
}

export async function create(playerId: number, name: string, client: DbOrTransaction = db): Promise<Ship> {
  const [row] = await client.insert(ship).values({ playerId, name }).returning();
  return row!;
}

export async function rename(shipId: number, newName: string, client: DbOrTransaction = db): Promise<Ship> {
  const [row] = await client.update(ship).set({ name: newName }).where(eq(ship.id, shipId)).returning();
  return row!;
}
