import type { Inventory } from '../../resource/types.js';
import type { Character } from '../types.js';

export type TrialOfWillContext = {
  crew: Array<Character>;
  reserve: Array<Character>;
  inventory: Inventory;
};

export type TrialOfWillCriterion = {
  condition: (context: TrialOfWillContext) => boolean;
  /** Poids ajouté à la probabilité de réussite si validé, pas un score comparé à un seuil. */
  weight: number;
  successText: string;
  failureText: string;
};

export type TrialOfWillDefinition = {
  characterTemplateName: string;
  criteria: Array<TrialOfWillCriterion>;
};

export type TrialOfWillCriterionOutcome = {
  criterion: TrialOfWillCriterion;
  passed: boolean;
};

export type TrialOfWillResult = {
  characterTemplateName: string;
  outcomes: Array<TrialOfWillCriterionOutcome>;
  /**
   * Somme des poids des critères validés. Sert de probabilité de réussite (`min(percentage, 100) / 100`), pas de
   * seuil fixe. Le total maximal atteignable dépend de chaque définition, pas d'une règle globale : un personnage
   * difficile peut plafonner à 30 (30% de chances même avec tous les critères), un personnage facile peut monter à
   * 400 ou 1000 (quelques critères suffisent à garantir la réussite — la probabilité réelle est alors saturée à 100%).
   */
  percentage: number;
  passed: boolean;
};
