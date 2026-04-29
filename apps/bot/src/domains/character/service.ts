import { NotFoundError } from '../../discord/errors.js';

import * as characterRepository from './repository.js';
import type { CharacterRow } from './types.js';

export async function getCrewByPlayerId(playerId: number): Promise<Array<CharacterRow>> {
  const characters = await characterRepository.getCharactersByPlayerId(playerId);
  const crew = characters.filter((character) => character.joinedCrewAt !== null);

  if (crew.length === 0) {
    throw new NotFoundError("Tu n'as aucun character dans ton équipage.");
  }

  return crew;
}
