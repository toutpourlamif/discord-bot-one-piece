import type { PassiveGenerator } from '../../types.js';

import { calmSea } from './calm-sea.js';
import { roughSea } from './rough-sea.js';
import { seagullFlyby } from './seagull-flyby.js';

export const passiveGenerators: Array<PassiveGenerator> = [seagullFlyby, calmSea, roughSea];
