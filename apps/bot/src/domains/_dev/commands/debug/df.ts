import * as devilFruitRepository from '../../../devil_fruit/repository.js';

import { replyDebugData, type DebugArgs, type DebugMessage } from './utils.js';

export async function handleDf(message: DebugMessage, args: DebugArgs): Promise<void> {
  const rawId = args[1];
  const id = Number(rawId);

  if (!Number.isInteger(id)) {
    await message.reply('Tu dois fournir un id de devil fruit valide.');
    return;
  }

  const devilFruit = await devilFruitRepository.findById(id);

  if (!devilFruit) {
    await message.reply(`Aucun devil fruit trouvé avec l'id ${id}.`);
    return;
  }

  await replyDebugData(message, devilFruit);
}
