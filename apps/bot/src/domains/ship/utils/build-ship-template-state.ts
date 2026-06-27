import { getShipTemplate, type ShipTemplateKey } from '../templates.js';
import type { ShipTemplateState } from '../types.js';

import { getMaxHpForHullLevel } from './ship-module-helpers.js';

export function buildShipTemplateState(templateKey: ShipTemplateKey): ShipTemplateState {
  const { label, startingLevels } = getShipTemplate(templateKey);
  return {
    templateKey,
    name: label,
    hp: getMaxHpForHullLevel(startingLevels.hull),
    hullLevel: startingLevels.hull,
    sailLevel: startingLevels.sail,
    decksLevel: startingLevels.decks,
    cabinsLevel: startingLevels.cabins,
    cargoLevel: startingLevels.cargo,
  };
}
