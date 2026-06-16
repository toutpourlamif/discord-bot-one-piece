import type { Player } from '@one-piece/db';

import { ValidationError } from '../../../discord/errors.js';
import { isSea } from '../utils/index.js';

export function assertPlayerIsNotAtSea(player: Player): void {
  if (player.travelTargetZone !== null || isSea(player.currentZone)) {
    throw new ValidationError('🌊 Tu es en mer : reviens à quai.');
  }
}
