import type { Command } from '../../../../discord/types.js';
import { resolveTargetPlayer } from '../../../player/index.js';

import { replyDebugData } from './utils.js';

export const handlePlayer: Command['handler'] = async (ctx) => {
  const targetPlayer = await resolveTargetPlayer(ctx);

  await replyDebugData(ctx.message, targetPlayer);
};
