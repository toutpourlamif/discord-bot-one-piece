import type { CharacterInstance } from '@one-piece/db';

import * as characterRepository from './repository.js';

export async function giveCharacter(playerId: number, templateId: number): Promise<CharacterInstance> {
  return characterRepository.giveCharacterToPlayer(playerId, templateId);
}
