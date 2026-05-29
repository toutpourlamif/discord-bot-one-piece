/* eslint-disable no-param-reassign */
import { type Transaction } from '@one-piece/db';

import { NotFoundError } from '../../../discord/errors.js';
import * as characterRepository from '../../character/repository.js';
import * as economyRepository from '../../economy/repository.js';
import { changeSubZone } from '../../navigation/services/change-sub-zone.js';
import { completeTravel } from '../../navigation/services/complete-travel.js';
import { startTravel } from '../../navigation/services/start-travel.js';
import { updateTravelTarget } from '../../navigation/services/update-travel-target.js';
import { getEntrySubZone } from '../../navigation/utils/index.js';
import * as resourceRepository from '../../resource/repository.js';
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
        ctx.player.currentSubZone = null;
        ctx.zone = effect.edge.via;
        ctx.subZone = null;
        break;
      case 'completeTravel':
        await completeTravel({
          playerId: ctx.player.id,
          fromSea: effect.fromSea,
          startedBucket: effect.startedBucket,
          arrivedZone: effect.arrivedZone,
          drifted: effect.drifted,
          intendedTo: effect.intendedTo,
          bucketId: ctx.bucketId,
          tx,
        });
        ctx.player.travelTargetZone = null;
        ctx.player.travelStartedBucket = null;
        ctx.player.travelEtaBucket = null;
        ctx.player.currentZone = effect.arrivedZone;
        ctx.player.currentSubZone = getEntrySubZone(effect.arrivedZone);
        ctx.zone = effect.arrivedZone;
        ctx.subZone = getEntrySubZone(effect.arrivedZone);
        break;
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
      case 'changeSubZone':
        await changeSubZone({ playerId: ctx.player.id, targetSubZone: effect.targetSubZone, bucketId: ctx.bucketId, tx });
        ctx.player.currentSubZone = effect.targetSubZone;
        ctx.subZone = effect.targetSubZone;
        break;
      case 'addResource': {
        await resourceRepository.addResource({
          playerId: ctx.player.id,
          name: effect.name,
          quantity: effect.quantity,
          options: { client: tx },
        });
        const existing = ctx.inventory.find((r) => r.name === effect.name);
        if (existing) existing.quantity += effect.quantity;
        else ctx.inventory.push({ name: effect.name, quantity: effect.quantity });
        break;
      }
      case 'addCharacter': {
        const template = await characterRepository.findTemplateByName(effect.templateName, tx);
        if (!template) throw new NotFoundError(`Personnage introuvable : ${effect.templateName}.`);
        await characterRepository.createCharacterInstance(ctx.player.id, template.id, tx);
        break;
      }
    }
  }
}
