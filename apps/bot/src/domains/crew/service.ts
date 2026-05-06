import { db, type Player } from '@one-piece/db';

import { NotFoundError, ValidationError } from '../../discord/errors.js';
import { sanitizeName } from '../../shared/sanitize-name.js';
import * as characterRepository from '../character/repository.js';
import type { CharacterRow } from '../character/types.js';
import * as historyRepository from '../history/index.js';
import * as playerRepository from '../player/repository.js';

import { MAX_CREW_NAME_LENGTH } from './constants.js';
import * as crewRepository from './repository.js';

export async function getCrewByPlayerId(playerId: number): Promise<Array<CharacterRow>> {
  const characters = await characterRepository.getCharactersByPlayerId(playerId);
  const crew = characters.filter((character) => character.joinedCrewAt !== null);

  if (crew.length === 0) {
    throw new NotFoundError("Tu n'as aucun personnage dans ton équipage.");
  }

  return crew;
}

export async function replaceCaptainOfPlayer(playerId: number, instanceId: number): Promise<void> {
  await db.transaction(async (transaction) => {
    const previousCaptainId = await crewRepository.removeCaptain(playerId, transaction);

    const captainReplaced = await crewRepository.setCaptain(playerId, instanceId, transaction);
    if (!captainReplaced) {
      throw new NotFoundError("Ce personnage n'est pas dans ton équipage.");
    }

    await historyRepository.appendHistory({
      type: 'crew.captain_changed',
      payload: {
        fromCharacterInstanceId: previousCaptainId,
        toCharacterInstanceId: instanceId,
      },
      actorPlayerId: playerId,
      target: { type: 'character_instance', id: instanceId },
      client: transaction,
    });
  });
}

export async function renameCrew(playerId: number, rawName: string): Promise<Player> {
  const sanitizedName = sanitizeName(rawName);
  if (sanitizedName.length === 0) {
    throw new ValidationError('Tu dois donner un nom.');
  }
  if (sanitizedName.length > MAX_CREW_NAME_LENGTH) {
    throw new ValidationError(`Le nom de l'équipage ne peut pas dépasser ${MAX_CREW_NAME_LENGTH} caractères.`);
  }

  return playerRepository.updateCrewName(playerId, sanitizedName);
}
