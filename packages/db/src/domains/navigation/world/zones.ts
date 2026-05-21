import { ISLANDS, type Island } from './islands/registry.js';
import { SEAS, type Sea } from './seas/registry.js';

export const ZONES = [...ISLANDS, ...SEAS] as const;

export type Zone = (typeof ZONES)[number];

export { ISLANDS, type Island };
export { SEAS, type Sea };
