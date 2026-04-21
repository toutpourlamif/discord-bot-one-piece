import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

import { requireDatabaseUrl } from './src/env.js';

config({ path: '.env.local' });

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema.ts',
  out: './drizzle',
  dbCredentials: { url: requireDatabaseUrl() },
  strict: true,
  verbose: true,
});
