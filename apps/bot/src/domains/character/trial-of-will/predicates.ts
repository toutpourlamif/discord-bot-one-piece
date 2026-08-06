import type { PlayerStatKey, ResourceName } from '@one-piece/db';

import type { TrialOfWillContext } from './types.js';

export function hasAnyResource(resourceNames: Array<ResourceName>): (context: TrialOfWillContext) => boolean {
  return (context) => context.inventory.some((item) => resourceNames.includes(item.name));
}

export function hasCharacterInReserve(characterTemplateName: string): (context: TrialOfWillContext) => boolean {
  return (context) => context.reserve.some((character) => character.name === characterTemplateName);
}

export function hasCharacterInReserveOrCrew(characterTemplateName: string): (context: TrialOfWillContext) => boolean {
  return (context) =>
    context.reserve.some((character) => character.name === characterTemplateName) ||
    context.crew.some((character) => character.name === characterTemplateName);
}

export function hasCrewSizeAtLeast(minimumSize: number): (context: TrialOfWillContext) => boolean {
  return (context) => context.crew.length >= minimumSize;
}

export function hasStatAtLeast(statKey: PlayerStatKey, minimumValue: number): (context: TrialOfWillContext) => boolean {
  return (context) => context.player[statKey] >= minimumValue;
}
