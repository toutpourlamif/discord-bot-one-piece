import type { CrewLog } from './crew.js';
import type { FishingLog } from './fishing.js';
import type { NavigationLog } from './navigation.js';
import type { PlayerLog } from './player.js';
import type { ShipLog } from './ship.js';

// TODO: MIGRER TOUS LES types de log en CAMEL CASE aulieu de SNAKE CASE
export type Log = CrewLog | PlayerLog | FishingLog | ShipLog | NavigationLog;
