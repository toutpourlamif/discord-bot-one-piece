import type { Command } from '../../../discord/types.js';
import { replyDebugData } from '../../../discord/utils/index.js';
import * as historyRepository from '../../history/repository.js';
import { resolveTargetPlayer } from '../../player/index.js';

export const showHistoryCommand: Command = {
  name: ['showHistory', 'show-history'],
  async handler(ctx) {
    const { targetPlayer } = await resolveTargetPlayer(ctx);
    const history = await historyRepository.loadAllForPlayer(targetPlayer.id);

    await replyDebugData(ctx.message, history);
  },
};
