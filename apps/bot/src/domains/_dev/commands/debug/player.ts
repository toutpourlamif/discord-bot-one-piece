import { getTargetUser } from '../../../../discord/utils/get-target-user.js';
import { findOrCreatePlayer } from '../../../player/service.js';

import { replyDebugData, type DebugArgs, type DebugMessage } from './utils.js';

export async function handlePlayer(message: DebugMessage, _args: DebugArgs): Promise<void> {
  const target = getTargetUser(message);
  const { player } = await findOrCreatePlayer(target.id, target.username);

  await replyDebugData(message, player);
}
