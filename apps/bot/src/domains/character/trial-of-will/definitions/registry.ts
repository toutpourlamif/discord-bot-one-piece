import { buildRegistry } from '../../../../shared/build-registry.js';
import type { TrialOfWillDefinition } from '../types.js';

import { nicoRobinTrialOfWill } from './nico-robin.js';

const ALL_TRIAL_OF_WILL_DEFINITIONS: Array<TrialOfWillDefinition> = [nicoRobinTrialOfWill];

export const trialOfWillDefinitions = buildRegistry(ALL_TRIAL_OF_WILL_DEFINITIONS, (definition) => definition.characterTemplateName);
