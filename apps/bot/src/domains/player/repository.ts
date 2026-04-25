import { db, player, resourceInstance, resourceTemplate, type Player } from '@one-piece/db';
import { asc, eq } from 'drizzle-orm';

export type InventoryResource = {
  name: string;
  quantity: number;
};

export async function findById(id: number): Promise<Player | undefined> {
  const [row] = await db.select().from(player).where(eq(player.id, id)).limit(1);
  return row;
}

export async function findByDiscordId(discordId: string): Promise<Player | undefined> {
  const [row] = await db.select().from(player).where(eq(player.discordId, discordId)).limit(1);
  return row;
}

export async function create(discordId: string, name: string): Promise<Player> {
  const [row] = await db.insert(player).values({ discordId, name }).returning();
  return row!;
}

export async function updateName(playerId: number, name: string): Promise<Player> {
  const [row] = await db.update(player).set({ name }).where(eq(player.id, playerId)).returning();
  return row!;
}

export async function findInventoryByPlayerId(playerId: number): Promise<Array<InventoryResource>> {
  return db
    .select({
      name: resourceTemplate.name,
      quantity: resourceInstance.quantity,
    })
    .from(resourceInstance)
    .innerJoin(resourceTemplate, eq(resourceInstance.templateId, resourceTemplate.id))
    .where(eq(resourceInstance.playerId, playerId))
    .orderBy(asc(resourceTemplate.name));
}
