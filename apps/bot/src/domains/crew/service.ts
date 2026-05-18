import { db, type CharacterInstance, type Player } from '@one-piece/db';

import { NotFoundError, ValidationError } from '../../discord/errors.js';
import { sanitizeName } from '../../shared/sanitize-name.js';
import * as characterRepository from '../character/repository.js';
import type { CharacterRow } from '../character/types.js';
import * as historyRepository from '../history/index.js';
import * as playerRepository from '../player/repository.js';
import * as shipRepository from '../ship/repository.js';

import { MAX_CREW_NAME_LENGTH, MIN_CREW_NAME_LENGTH } from './constants.js';
import * as crewRepository from './repository.js';
import { getCrewCapacity } from './utils/get-crew-capacity.js';
import { isInCrewFilter } from './utils/is-in-crew-filter.js';

export async function getCrewByPlayerId(playerId: number): Promise<Array<CharacterRow>> {
  const characters = await characterRepository.getCharactersByPlayerId(playerId);
  const crew = characters.filter(isInCrewFilter);

  if (crew.length === 0) {
    throw new NotFoundError("Tu n'as aucun personnage dans ton équipage.");
  }

  return crew;
}

export async function embarkCharacter(playerId: number, instanceId: number): Promise<void> {
  await db.transaction(async (transaction) => {
    const character = await crewRepository.findCharacterInstanceById(instanceId, transaction, { forUpdate: true });
    assertCharacterBelongsToPlayer(character, playerId);
    assertCharacterIsInReserve(character);

    const ship = await shipRepository.findByPlayerIdOrThrow(playerId, transaction, { forUpdate: true });
    const characters = await characterRepository.getCharactersByPlayerId(playerId, transaction);
    const crewSize = characters.filter(isInCrewFilter).length;
    if (crewSize >= getCrewCapacity(ship)) {
      throw new ValidationError("Ton équipage est plein, débarque quelqu'un d'abord.");
    }

    await crewRepository.setCharacterCrewMembership(instanceId, new Date(), transaction);
  });
}

export async function disembarkCharacter(playerId: number, instanceId: number): Promise<void> {
  await db.transaction(async (transaction) => {
    const character = await crewRepository.findCharacterInstanceById(instanceId, transaction, { forUpdate: true });
    assertCharacterBelongsToPlayer(character, playerId);
    assertCharacterIsInCrew(character);
    assertCharacterIsNotCaptain(character);

    await crewRepository.setCharacterCrewMembership(instanceId, null, transaction);
  });
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
  if (sanitizedName.length < MIN_CREW_NAME_LENGTH) {
    throw new ValidationError(`Le nom de l'équipage doit faire au moins ${MIN_CREW_NAME_LENGTH} caractères.`);
  }
  if (sanitizedName.length > MAX_CREW_NAME_LENGTH) {
    throw new ValidationError(`Le nom de l'équipage ne peut pas dépasser ${MAX_CREW_NAME_LENGTH} caractères.`);
  }

  return playerRepository.updateCrewName(playerId, sanitizedName);
}

function assertCharacterBelongsToPlayer(
  character: CharacterInstance | undefined,
  playerId: number,
): asserts character is CharacterInstance {
  if (character?.playerId === playerId) return;

  throw new ValidationError("Ce personnage ne t'appartient pas.");
}

function assertCharacterIsInReserve(character: { joinedCrewAt: Date | null }): void {
  if (character.joinedCrewAt === null) return;

  throw new ValidationError('Ce personnage est déjà dans ton équipage.');
}

function assertCharacterIsInCrew(character: { joinedCrewAt: Date | null }): void {
  if (character.joinedCrewAt !== null) return;

  throw new ValidationError("Ce personnage n'est pas dans ton équipage.");
}

function assertCharacterIsNotCaptain(character: { isCaptain: boolean }): void {
  if (!character.isCaptain) return;

  throw new ValidationError("Réassigne le capitaine d'abord avec !changecaptain.");
}
