import { db, type CharacterInstance } from '@one-piece/db';

import { ValidationError } from '../../../discord/errors.js';
import * as crewRepository from '../repository.js';

export async function disembarkCharacter(playerId: number, instanceId: number): Promise<void> {
  await db.transaction(async (transaction) => {
    const character = await crewRepository.findCharacterInstanceById(instanceId, transaction, { forUpdate: true });
    assertCharacterBelongsToPlayer(character, playerId);
    assertCharacterIsInCrew(character);
    assertCharacterIsNotCaptain(character);

    await crewRepository.setCharacterJoinedAt(instanceId, null, transaction);
  });
}

function assertCharacterBelongsToPlayer(
  character: CharacterInstance | undefined,
  playerId: number,
): asserts character is CharacterInstance {
  if (character?.playerId !== playerId) {
    throw new ValidationError("Ce personnage ne t'appartient pas.");
  }
}

function assertCharacterIsInCrew(character: { joinedCrewAt: Date | null }): void {
  if (character.joinedCrewAt === null) {
    throw new ValidationError("Ce personnage n'est pas dans ton équipage.");
  }
}

function assertCharacterIsNotCaptain(character: { isCaptain: boolean }): void {
  if (character.isCaptain) {
    throw new ValidationError("Réassigne le capitaine d'abord avec !changecaptain.");
  }
}
