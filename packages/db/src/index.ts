import type { player } from './schema/index.js';

export { db } from './client.js';
export * from './schema/index.js';

export type Player = typeof player.$inferSelect;
