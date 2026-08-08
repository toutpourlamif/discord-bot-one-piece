import { db, player, type DbOrTransaction, type Player, type PlayerStatKey } from '@one-piece/db';
import { eq, sql } from 'drizzle-orm';

import { NotFoundError } from '../../../discord/errors.js';

import { STAT_MAX, STAT_MIN } from './constants.js';

export async function adjustStat(playerId: number, statKey: PlayerStatKey, amount: number, client: DbOrTransaction = db): Promise<Player> {
  const statColumn = player[statKey];
  const [row] = await client
    .update(player)
    .set({ [statKey]: sql`greatest(${STAT_MIN}, least(${STAT_MAX}, ${statColumn} + ${amount}))` })
    .where(eq(player.id, playerId))
    .returning();
  if (!row) throw new NotFoundError('Joueur introuvable.');
  return row;
}
