import { type DbOrTransaction } from '@one-piece/db';

import * as economyRepository from '../../economy/repository.js';
import type { GeneratorContext } from '../types.js';

import type { EventEffect } from './types.js';

/**
 * Applique les effets en DB **et** mute `ctx` en place pour que les générateurs
 * suivants (même bucket ou buckets ultérieurs) voient l'état à jour sans refetch.
 */
export async function applyEffects(effects: Array<EventEffect>, ctx: GeneratorContext, tx: DbOrTransaction): Promise<void> {
  for (const effect of effects) {
    switch (effect.type) {
      case 'addBerries':
        await economyRepository.creditBerry(ctx.player.id, effect.amount, tx);
        ctx.player.berries += effect.amount;
        break;
      case 'spendBerries':
        await economyRepository.debitBerry(ctx.player.id, effect.amount, tx);
        ctx.player.berries -= effect.amount;
        break;
    }
  }
}
