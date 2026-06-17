import type { InteractiveGenerator } from '../../types.js';

import { aceEmotionsTest } from './ace-emotions-test.js';
import { barrelFound } from './barrel-found.js';
import { cheatTeleport } from './cheat-teleport.js';
import { kobyEncounter } from './koby-encounter.js';

export const interactiveGenerators: Array<InteractiveGenerator> = [barrelFound, cheatTeleport, kobyEncounter, aceEmotionsTest];
