import { db, ship, SHIP_MODULE_LEVEL_COLUMNS, type DbOrTransaction, type Ship, type ShipModuleKey } from '@one-piece/db';
import { eq } from 'drizzle-orm';

import { NotFoundError } from '../../discord/errors.js';

type FindByPlayerIdOptions = {
  forUpdate?: boolean;
};

export async function findByPlayerId(
  playerId: number,
  client: DbOrTransaction = db,
  options: FindByPlayerIdOptions = {},
): Promise<Ship | undefined> {
  if (options.forUpdate) {
    const [row] = await client.select().from(ship).where(eq(ship.playerId, playerId)).limit(1).for('update');
    return row;
  }

  const [row] = await client.select().from(ship).where(eq(ship.playerId, playerId)).limit(1);
  return row;
}

export async function findByPlayerIdOrThrow(
  playerId: number,
  client: DbOrTransaction = db,
  options: FindByPlayerIdOptions = {},
): Promise<Ship> {
  const row = await findByPlayerId(playerId, client, options);
  if (!row) throw new NotFoundError();
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

export async function updateModuleLevel(
  shipId: number,
  moduleKey: ShipModuleKey,
  level: number,
  client: DbOrTransaction = db,
): Promise<Ship> {
  const levelColumn = SHIP_MODULE_LEVEL_COLUMNS[moduleKey];
  const [row] = await client
    .update(ship)
    .set({ [levelColumn]: level })
    .where(eq(ship.id, shipId))
    .returning();
  return row!;
}
