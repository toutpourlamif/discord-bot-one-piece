import { NotFoundError } from '../../../../discord/errors.js';
import type { Command } from '../../../../discord/types.js';
import { parseIntegerArg } from '../../../../discord/utils/parse-integer-arg.js';
import * as devilFruitRepository from '../../../devil_fruit/repository.js';

import { replyDebugData } from './utils.js';

export const handleDf: Command['handler'] = async (message, args) => {
  const id = parseIntegerArg(args[0]);

  const devilFruit = await devilFruitRepository.findById(id);

  if (!devilFruit) {
    throw new NotFoundError('Devil fruit introuvable.');
  }

  await replyDebugData(message, devilFruit);
};
