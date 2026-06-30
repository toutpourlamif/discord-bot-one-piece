import type { Character } from '../../character/types.js';

const CAPTAIN_EMOJI = '⭐';

export function formatCharacterName(character: Character): string {
  const suffix = character.isCaptain ? ` ${CAPTAIN_EMOJI}` : '';
  return `${character.name}${suffix}`;
}
