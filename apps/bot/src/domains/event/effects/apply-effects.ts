import { type DbOrTransaction } from '@one-piece/db';

import * as economyRepository from '../../economy/repository.js';

import type { EventEffect } from './types.js';

export async function applyEffects(effects: Array<EventEffect>, playerId: number, tx: DbOrTransaction): Promise<void> {
  for (const effect of effects) {
    switch (effect.type) {
      case 'addBerries':
        await economyRepository.creditBerry(playerId, effect.amount, tx);
        break;
      case 'spendBerries':
        await economyRepository.debitBerry(playerId, effect.amount, tx);
        break;
    }
  }
}
