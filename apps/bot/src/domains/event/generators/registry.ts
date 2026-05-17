import { NotFoundError, ValidationError } from '../../../discord/errors.js';
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

export function findGeneratorByFuzzyKeyOrThrow(query: string): EventGenerator {
  const lower = query.toLowerCase();
  const exact = allGenerators.find((gen) => gen.key.toLowerCase() === lower);
  if (exact) return exact;

  const matches = allGenerators.filter((gen) => gen.key.toLowerCase().includes(lower));
  if (matches.length === 1) return matches[0]!;
  if (matches.length > 1) {
    const keys = matches.map((gen) => gen.key).join(', ');
    throw new ValidationError(`Plusieurs générateurs matchent "${query}": ${keys}`);
  }
  throw new NotFoundError(`Générateur introuvable pour l'évènement: ${query}`);
}
