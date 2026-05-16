import { type Transaction } from '@one-piece/db';

import { InternalError } from '../../../discord/errors.js';
import * as economyRepository from '../../economy/repository.js';
import { completeTravel } from '../../navigation/services/complete-travel.js';
import { startTravel } from '../../navigation/services/start-travel.js';
import { updateTravelTarget } from '../../navigation/services/update-travel-target.js';
import type { GeneratorContext } from '../types.js';

import type { EventEffect } from './types.js';

/**
 * Applique les effets en DB **et** mute `ctx` en place pour que les générateurs
 * suivants (même bucket ou buckets ultérieurs) voient l'état à jour sans refetch.
 */
export async function applyEffects(effects: Array<EventEffect>, ctx: GeneratorContext, tx: Transaction): Promise<void> {
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
      case 'startTravel':
        await startTravel({ playerId: ctx.player.id, edge: effect.edge, etaBucket: effect.etaBucket, bucketId: ctx.bucketId, tx });
        ctx.player.travelTargetZone = effect.edge.to;
        ctx.player.travelStartedBucket = ctx.bucketId;
        ctx.player.travelEtaBucket = effect.etaBucket;
        ctx.player.currentZone = effect.edge.via;
        ctx.zone = effect.edge.via;
        break;
      case 'completeTravel': {
        if (ctx.player.travelTargetZone === null) {
          throw new InternalError('completeTravel effect emitted but player.travelTargetZone is null.');
        }
        const drifted = effect.drifted ?? false;
        const intendedTo = effect.intendedTo ?? ctx.player.travelTargetZone;
        await completeTravel({
          playerId: ctx.player.id,
          arrivedZone: effect.arrivedZone,
          drifted,
          intendedTo,
          bucketId: ctx.bucketId,
          tx,
        });
        ctx.player.travelTargetZone = null;
        ctx.player.travelStartedBucket = null;
        ctx.player.travelEtaBucket = null;
        ctx.player.currentZone = effect.arrivedZone;
        ctx.zone = effect.arrivedZone;
        break;
      }
      case 'updateTravelTarget':
        await updateTravelTarget({
          playerId: ctx.player.id,
          newEdge: effect.newEdge,
          newEtaBucket: effect.newEtaBucket,
          bucketId: ctx.bucketId,
          tx,
        });
        ctx.player.travelTargetZone = effect.newEdge.to;
        ctx.player.travelEtaBucket = effect.newEtaBucket;
        if (ctx.player.currentZone !== effect.newEdge.via) {
          ctx.player.currentZone = effect.newEdge.via;
          ctx.zone = effect.newEdge.via;
        }
        break;
    }
  }
}
