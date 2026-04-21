import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

import { requireDatabaseUrl } from './env.js';

const migrationClient = postgres(requireDatabaseUrl(), { max: 1 });
const db = drizzle(migrationClient);

await migrate(db, { migrationsFolder: './drizzle' });

await migrationClient.end();
console.log('Migrations appliquées');
