import { NotFoundError } from '../../../../discord/errors.js';
import type { Command } from '../../../../discord/types.js';
import { parseIntegerArg, replyDebugData } from '../../../../discord/utils/index.js';
import * as devilFruitRepository from '../../../devil_fruit/repository.js';

export const handleDf: Command['handler'] = async ({ message, args }) => {
  const id = parseIntegerArg(args[0]);

  const devilFruit = await devilFruitRepository.findById(id);

  if (!devilFruit) {
    throw new NotFoundError('Devil fruit introuvable.');
  }

  await replyDebugData(message, devilFruit);
};
