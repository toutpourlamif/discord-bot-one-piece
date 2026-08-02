import { db, type DbOrTransaction } from '@one-piece/db';

import { ValidationError } from '../../../discord/errors.js';
import * as historyRepository from '../../history/index.js';
import { FISHING_MAX_ATTEMPTS_PER_HOUR } from '../constants.js';
import type { FishingResult } from '../types.js';
import { buildUnseededRng, rollFishingOutcome } from '../utils/index.js';

import { applyFishingOutcome } from './apply-fishing-outcome.js';
import { getEligibleFishingResourceNames } from './get-eligible-fishing-resource-names.js';

export async function runFishingAttempt(playerId: number, client: DbOrTransaction = db): Promise<FishingResult> {
  await assertFishingQuotaAvailable(playerId, client);

  const eligibleResourceNames = await getEligibleFishingResourceNames(client);
  const outcome = rollFishingOutcome(buildUnseededRng(), eligibleResourceNames);
  await applyFishingOutcome(playerId, outcome, client);

  return outcome;
}

/** Quota horaire aligné sur l'horloge murale (reset à chaque heure pile, pas une fenêtre glissante depuis le dernier lancer). */
async function assertFishingQuotaAvailable(playerId: number, client: DbOrTransaction): Promise<void> {
  const currentHourStart = getCurrentHourStart();
  const attemptsThisHour = await historyRepository.countForPlayerSince(playerId, currentHourStart, { type: 'fishing.attempt', client });
  if (attemptsThisHour < FISHING_MAX_ATTEMPTS_PER_HOUR) return;

  const nextHourStart = new Date(currentHourStart.getTime() + 60 * 60 * 1000);
  const minutesUntilReset = Math.max(1, Math.ceil((nextHourStart.getTime() - Date.now()) / 60_000));
  throw new ValidationError(
    `Tu as atteint la limite de ${FISHING_MAX_ATTEMPTS_PER_HOUR} pêches cette heure-ci. Réessaie dans ${minutesUntilReset} minute${minutesUntilReset > 1 ? 's' : ''}.`,
  );
}

function getCurrentHourStart(): Date {
  const date = new Date();
  date.setMinutes(0, 0, 0);
  return date;
}
