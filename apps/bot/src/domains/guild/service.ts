import { AppError } from '../../discord/errors.js';

import * as guildRepository from './repository.js';

const SERVER_ONLY_MESSAGE = 'Le bot se joue uniquement sur un serveur Discord. Invite-le sur ton serveur ou rejoins-en un.';

export class ServerOnlyError extends AppError {
  constructor() {
    super(SERVER_ONLY_MESSAGE, 'warn');
    this.name = 'ServerOnlyError';
  }
}

export async function ensureGuildExists(guildId: string | null): Promise<void> {
  if (!guildId) throw new ServerOnlyError();

  await guildRepository.insertGuildIfNotExists(guildId);
}
