import chalk from 'chalk';
import { getTableName, type Table } from 'drizzle-orm';

export function logSeed(table: Table, rows: ReadonlyArray<unknown>) {
  const tableName = getTableName(table);
  const count = rows.length;

  console.log(`Seed ${chalk.blue(tableName)} ${chalk.green('OK')} ${chalk.yellow(`(${count})`)}`);
}
