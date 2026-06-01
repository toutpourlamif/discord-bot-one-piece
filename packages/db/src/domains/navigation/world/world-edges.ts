import { EAST_BLUE_EDGES } from './east-blue/edges.js';
import { PARADISE_EDGES } from './paradise/edges.js';
import type { Edge } from './types.js';

export const WORLD_EDGES: Array<Edge> = [...EAST_BLUE_EDGES, ...PARADISE_EDGES];
