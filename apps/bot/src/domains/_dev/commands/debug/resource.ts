import * as resourceRepository from '../../../resource/repository.js';

import { replyDebugData, type DebugArgs, type DebugMessage } from './utils.js';

export async function handleResource(message: DebugMessage, args: DebugArgs): Promise<void> {
  const rawId = args[1];
  const id = Number(rawId);

  if (!Number.isInteger(id)) {
    await message.reply('Tu dois fournir un id de resource valide.');
    return;
  }

  const resource = await resourceRepository.findById(id);

  if (!resource) {
    await message.reply(`Aucune resource trouvée avec l'id ${id}.`);
    return;
  }

  await replyDebugData(message, resource);
}
