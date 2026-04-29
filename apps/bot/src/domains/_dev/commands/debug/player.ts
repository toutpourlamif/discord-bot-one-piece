import type { Command } from '../../../../discord/types.js';
import { getTargetUser } from '../../../../discord/utils/index.js';
import { findOrCreatePlayer } from '../../../player/service.js';

import { replyDebugData } from './utils.js';

export const handlePlayer: Command['handler'] = async (message) => {
  const target = getTargetUser(message);
  const { player } = await findOrCreatePlayer(target.id, target.username);

  await replyDebugData(message, player);
};
