import {
  characterInstance,
  characterTemplate,
  db,
  devilFruitInstance,
  devilFruitTemplate,
  player,
  resourceInstance,
  resourceTemplate,
  ship,
} from '@one-piece/db';
import { eq } from 'drizzle-orm';
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core';

import { NotFoundError } from '../../../../discord/errors.js';
import type { Command } from '../../../../discord/types.js';
import { parseIntegerArg, parseStringArg, replyDebugData } from '../../../../discord/utils/index.js';

type TableWithIdColumn = PgTable & { id: PgColumn };

const DEBUG_TABLES: Record<string, TableWithIdColumn> = {
  player: player,
  ship: ship,
  resource_instance: resourceInstance,
  resource_template: resourceTemplate,
  devil_fruit_instance: devilFruitInstance,
  devil_fruit_template: devilFruitTemplate,
  character_instance: characterInstance,
  character_template: characterTemplate,
};

const helpMessage = `Usage : \`debug <table> <id>\`\nTables : ${Object.keys(DEBUG_TABLES).join(', ')}`;

export const debugCommand: Command = {
  name: 'debug',
  async handler({ message, args }) {
    const tableName = parseStringArg(args[0]);
    const table = tableName ? DEBUG_TABLES[tableName] : undefined;

    if (!table) throw new NotFoundError(helpMessage);

    const id = parseIntegerArg(args[1]);
    const [row] = await db.select().from(table).where(eq(table.id, id)).limit(1);

    if (!row) throw new NotFoundError(`Aucune ligne \`${tableName}\` avec l'id ${id}.`);

    await replyDebugData(message, row);
  },
};
