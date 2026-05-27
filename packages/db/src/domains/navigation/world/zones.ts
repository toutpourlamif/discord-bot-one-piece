import { ISLANDS, type Island } from './registry.js';
import { SEAS, type Sea } from './seas.js';

export const ZONES = [...ISLANDS, ...SEAS] as const;

export type Zone = (typeof ZONES)[number];

export { ISLANDS, type Island };
export { SEAS, type Sea };
