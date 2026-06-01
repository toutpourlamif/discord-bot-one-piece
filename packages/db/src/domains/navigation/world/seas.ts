import { EAST_BLUE_SEA } from './east-blue/sea.js';
import { NEW_WORLD_SEA } from './new-world/sea.js';
import { PARADISE_SEA } from './paradise/sea.js';

const SEA_REGISTRY = [EAST_BLUE_SEA, PARADISE_SEA, NEW_WORLD_SEA];

export type Sea = (typeof SEA_REGISTRY)[number]['key'];

export const SEAS = SEA_REGISTRY.map((sea) => sea.key) as [Sea, ...Array<Sea>];

export const SEA_LABELS = Object.fromEntries(SEA_REGISTRY.map((sea) => [sea.key, sea.label])) as Record<Sea, string>;
