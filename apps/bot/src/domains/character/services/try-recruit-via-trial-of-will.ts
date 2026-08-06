import { NotFoundError } from '../../../discord/errors.js';
import { embarkCharacter } from '../../crew/services/index.js';
import { isInCrewFilter } from '../../crew/utils/is-in-crew-filter.js';
import * as playerRepository from '../../player/repository.js';
import * as resourceRepository from '../../resource/repository.js';
import * as characterRepository from '../repository.js';
import { trialOfWillDefinitions } from '../trial-of-will/definitions/registry.js';
import { runTrialOfWill } from '../trial-of-will/service.js';
import type { TrialOfWillContext, TrialOfWillResult } from '../trial-of-will/types.js';

export async function tryRecruitViaTrialOfWill(playerId: number, characterTemplateName: string): Promise<TrialOfWillResult> {
  const template = await characterRepository.findTemplateByName(characterTemplateName);
  if (!template) throw new NotFoundError(`Personnage recrutable introuvable : ${characterTemplateName}.`);

  const definition = trialOfWillDefinitions.get(characterTemplateName);
  if (!definition) throw new NotFoundError(`Aucune Épreuve de Volonté définie pour "${characterTemplateName}".`);

  const context = await buildTrialOfWillContext(playerId);
  const result = runTrialOfWill(context, definition, { next: Math.random });

  if (result.passed) {
    const instance = await characterRepository.createCharacterInstance(playerId, template.id);
    await embarkCharacter(playerId, instance.instanceId);
  }

  return result;
}

async function buildTrialOfWillContext(playerId: number): Promise<TrialOfWillContext> {
  const [player, characters, inventory] = await Promise.all([
    playerRepository.findByIdOrThrow(playerId),
    characterRepository.getCharactersByPlayerId(playerId),
    resourceRepository.getInventory(playerId),
  ]);

  return {
    player,
    crew: characters.filter(isInCrewFilter),
    reserve: characters.filter((character) => !isInCrewFilter(character)),
    inventory,
  };
}
