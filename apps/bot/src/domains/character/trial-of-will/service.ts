import type { Rng } from '../../event/engine/rng.js';

import type { TrialOfWillContext, TrialOfWillDefinition, TrialOfWillResult } from './types.js';

export function runTrialOfWill(context: TrialOfWillContext, definition: TrialOfWillDefinition, rng: Rng): TrialOfWillResult {
  const outcomes = definition.criteria.map((criterion) => ({ criterion, passed: criterion.condition(context) }));
  const percentage = outcomes.reduce((total, outcome) => (outcome.passed ? total + outcome.criterion.weight : total), 0);
  // percentage peut dépasser 100 (personnages "faciles", cf. TrialOfWillResult.percentage) : la probabilité réelle
  // sature à 100% plutôt que de dépasser 1, explicitement, pour ne pas donner l'impression d'un bug.
  const probability = Math.min(percentage, 100) / 100;

  return {
    characterTemplateName: definition.characterTemplateName,
    outcomes,
    percentage,
    passed: rng.next() < probability,
  };
}
