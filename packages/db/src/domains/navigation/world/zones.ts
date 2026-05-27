import { ISLANDS, ISLAND_LABELS } from './registry.js';
import { SEAS, SEA_LABELS } from './seas.js';

export const ZONES = [...ISLANDS, ...SEAS] as const;

export type Zone = (typeof ZONES)[number];

export const ZONE_LABELS: Record<Zone, string> = { ...ISLAND_LABELS, ...SEA_LABELS };
