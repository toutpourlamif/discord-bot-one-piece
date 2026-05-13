import type { Command } from '../../../../discord/types.js';
import { replyDebugData } from '../../../../discord/utils/index.js';
import { resolveTargetPlayer } from '../../../player/index.js';

export const handlePlayer: Command['handler'] = async (ctx) => {
  const { targetPlayer } = await resolveTargetPlayer(ctx);

  await replyDebugData(ctx.message, targetPlayer);
};
