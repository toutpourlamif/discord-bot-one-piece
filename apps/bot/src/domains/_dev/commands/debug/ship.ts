import { getTargetUser } from '../../../../discord/utils/get-target-user.js';
import { findOrCreatePlayer } from '../../../player/service.js';
import * as shipRepository from '../../../ship/repository.js';

import { replyDebugData, type DebugArgs, type DebugMessage } from './utils.js';

export async function handleShip(message: DebugMessage, _args: DebugArgs): Promise<void> {
  const target = getTargetUser(message);
  const { player } = await findOrCreatePlayer(target.id, target.username);
  const ship = await shipRepository.findByPlayerId(player.id);

  if (!ship) {
    await message.reply('Aucun ship trouvé pour ce player.');
    return;
  }

  await replyDebugData(message, ship);
}
