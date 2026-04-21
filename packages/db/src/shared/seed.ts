import { getTableName, type Table } from 'drizzle-orm';

export function logSeed(table: Table, rows: ReadonlyArray<unknown>) {
  console.log(`Seed ${getTableName(table)} OK (${rows.length})`);
}
