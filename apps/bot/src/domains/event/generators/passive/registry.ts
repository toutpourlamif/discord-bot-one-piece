import type { PassiveGenerator } from '../../types.js';

import { arrivalGenerators } from './arrivals/registry.js';
import { calmSea } from './calm-sea.js';
import { driftSurprise } from './drift-surprise.js';
import { peacefulEastBlue } from './peaceful-east-blue.js';
import { roughSea } from './rough-sea.js';
import { seagullFlyby } from './seagull-flyby.js';

export const passiveGenerators: Array<PassiveGenerator> = [
  seagullFlyby,
  calmSea,
  roughSea,
  peacefulEastBlue,
  driftSurprise,
  ...arrivalGenerators,
];
