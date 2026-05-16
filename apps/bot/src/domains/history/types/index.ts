import type { CrewLog } from './crew.js';
import type { FishingLog } from './fishing.js';
import type { NavigationLog } from './navigation.js';
import type { PlayerLog } from './player.js';
import type { ShipLog } from './ship.js';

export type Log = CrewLog | PlayerLog | FishingLog | ShipLog | NavigationLog;
