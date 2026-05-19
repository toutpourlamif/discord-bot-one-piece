import type { CharacterInstance } from '@one-piece/db';

import { ValidationError } from '../../../discord/errors.js';

export function assertCharacterExistsAndBelongsToPlayer(
  character: CharacterInstance | undefined,
  playerId: number,
): asserts character is CharacterInstance {
  if (character?.playerId !== playerId) {
    throw new ValidationError("Ce personnage ne t'appartient pas.");
  }
}
