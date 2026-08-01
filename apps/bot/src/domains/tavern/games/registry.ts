import type { TavernActivityType } from '@one-piece/db';

import { buildRegistry } from '../../../shared/build-registry.js';

import { coinFlipGame } from './coin-flip/index.js';
import type { TavernGame } from './types.js';

export const TAVERN_GAMES: Array<TavernGame> = [coinFlipGame];

const tavernGameRegistry = buildRegistry(TAVERN_GAMES, (tavernGame) => tavernGame.id);

export function findTavernGameById(tavernGameId: string): TavernGame | undefined {
  return tavernGameRegistry.get(tavernGameId);
}

/** retourne les jeux disponibles dans la tavern en question  */
export function getTavernGames(activities: Array<TavernActivityType>): Array<TavernGame> {
  return activities
    .map((activity) => tavernGameRegistry.get(activity))
    .filter((tavernGame): tavernGame is TavernGame => tavernGame !== undefined);
}
