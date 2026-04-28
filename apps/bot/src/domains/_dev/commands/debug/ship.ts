import { NotFoundError } from '../../../../discord/errors.js';
import type { Command } from '../../../../discord/types.js';
import { getTargetUser } from '../../../../discord/utils/get-target-user.js';
import { findOrCreatePlayer } from '../../../player/service.js';
import * as shipRepository from '../../../ship/repository.js';

import { replyDebugData } from './utils.js';

export const handleShip: Command['handler'] = async (message) => {
  const target = getTargetUser(message);
  const { player } = await findOrCreatePlayer(target.id, target.username);
  const ship = await shipRepository.findByPlayerId(player.id);

  if (!ship) {
    throw new NotFoundError('Ship introuvable.');
  }

  await replyDebugData(message, ship);
};
