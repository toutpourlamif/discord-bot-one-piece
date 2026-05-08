import type { EventGenerator } from '../types.js';

import { interactiveGenerators } from './interactive/registry.js';
import { passiveGenerators } from './passive/registry.js';

export { interactiveGenerators, passiveGenerators };

export const allGenerators: Array<EventGenerator> = [...passiveGenerators, ...interactiveGenerators];
