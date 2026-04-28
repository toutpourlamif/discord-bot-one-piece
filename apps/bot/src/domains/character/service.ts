import type { CharacterInstance } from '@one-piece/db';

import { giveCharacterToPlayer } from './repository.js';

export async function giveCharacter(playerId: number, templateId: number): Promise<CharacterInstance> {
  return giveCharacterToPlayer(playerId, templateId);
}
