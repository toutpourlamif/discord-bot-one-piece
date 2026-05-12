import { NotFoundError } from '../../../discord/errors.js';
import type { EventGenerator } from '../types.js';

import { interactiveGenerators } from './interactive/registry.js';
import { passiveGenerators } from './passive/registry.js';

export { interactiveGenerators, passiveGenerators };

export const allGenerators: Array<EventGenerator> = [...passiveGenerators, ...interactiveGenerators];

export function findGeneratorByKeyOrThrow(eventKey: string): EventGenerator {
  const generator = allGenerators.find((gen) => gen.key === eventKey);
  if (!generator) throw new NotFoundError(`Générateur introuvable pour l'évènement: ${eventKey}`);
  return generator;
}
