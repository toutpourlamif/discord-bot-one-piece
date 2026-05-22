import type { InteractiveGenerator } from '../../types.js';

import { barrelFound } from './barrel-found.js';
import { cheatTeleport } from './cheat-teleport.js';

export const interactiveGenerators: Array<InteractiveGenerator> = [barrelFound, cheatTeleport];
