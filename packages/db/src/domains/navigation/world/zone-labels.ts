import { ISLAND_LABELS } from './islands/registry.js';
import { SEA_LABELS } from './seas/registry.js';
import type { Zone } from './zones.js';

export const ZONE_LABELS: Record<Zone, string> = { ...ISLAND_LABELS, ...SEA_LABELS };
