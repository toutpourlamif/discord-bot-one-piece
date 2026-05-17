import type { Transaction } from '@one-piece/db';

import * as historyRepository from '../../history/index.js';
import { applyEffects } from '../effects/apply-effects.js';
import * as eventRepository from '../repository.js';
import type { GeneratorContext, InteractiveGenerator, PassiveGenerator, Rng } from '../types.js';

import type { GeneratorContextData } from './context-builders.js';

/**
 * Enregistre un passive : applique les effets, insère l'event_instance (idempotent), écrit la résolution dans history,
 * et propage l'event dans `ctxData.historyLogs` pour que les buckets suivants le voient (cooldown / oneTime / has).
 */
export async function recordPassive(
  gen: PassiveGenerator,
  ctx: GeneratorContext,
  ctxData: GeneratorContextData,
  rng: Rng,
  tx: Transaction,
): Promise<void> {
  const { effects, state } = gen.compute(ctx, rng);
  const playerId = ctx.player.id;
  const bucketId = ctx.bucketId;

  await applyEffects(effects, ctx, tx);
  await eventRepository.insertWithIdempotence({ playerId, eventKey: gen.key, isInteractive: false, bucketId, state }, tx);
  await historyRepository.writeEventResolution({ actorPlayerId: playerId, kind: gen.key, bucketId }, tx);
  ctxData.historyLogs.push({ kind: gen.key, bucketId });
}

/** Enregistre un interactif : insère l'event_instance avec son step initial. La résolution s'écrira au moment du choix. */
export async function recordInteractive(gen: InteractiveGenerator, ctx: GeneratorContext, tx: Transaction): Promise<void> {
  await eventRepository.insertWithIdempotence(
    { playerId: ctx.player.id, eventKey: gen.key, isInteractive: true, bucketId: ctx.bucketId, state: { step: gen.initialStep } },
    tx,
  );
}
