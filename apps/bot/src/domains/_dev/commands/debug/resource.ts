import { NotFoundError } from '../../../../discord/errors.js';
import type { Command } from '../../../../discord/types.js';
import { parseIntegerArg } from '../../../../discord/utils/index.js';
import * as resourceRepository from '../../../resource/repository.js';

import { replyDebugData } from './utils.js';

export const handleResource: Command['handler'] = async ({ message, args }) => {
  const id = parseIntegerArg(args[0]);

  const resource = await resourceRepository.findById(id);

  if (!resource) {
    throw new NotFoundError('Resource introuvable.');
  }

  await replyDebugData(message, resource);
};
