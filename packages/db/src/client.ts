import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { requireDatabaseUrl } from './env.js';
import * as schema from './schema.js';

const queryClient = postgres(requireDatabaseUrl());

export const db = drizzle(queryClient, { schema });

export async function closeDb() {
  await queryClient.end();
}

export type Db = typeof db;
