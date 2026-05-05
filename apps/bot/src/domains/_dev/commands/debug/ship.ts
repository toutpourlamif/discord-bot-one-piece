import { NotFoundError } from '../../../../discord/errors.js';
import type { Command } from '../../../../discord/types.js';
import { resolveTargetPlayer } from '../../../player/index.js';
import * as shipRepository from '../../../ship/repository.js';

import { replyDebugData } from './utils.js';

export const handleShip: Command['handler'] = async (ctx) => {
  const targetPlayer = await resolveTargetPlayer(ctx);
  const ship = await shipRepository.findByPlayerId(targetPlayer.id);

  if (!ship) {
    throw new NotFoundError('Ship introuvable.');
  }

  await replyDebugData(ctx.message, ship);
};
