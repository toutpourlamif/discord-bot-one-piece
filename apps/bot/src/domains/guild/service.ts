import { ServerOnlyError } from './errors.js';
import * as guildRepository from './repository.js';

export async function ensureGuildExists(guildId: string | null): Promise<void> {
  if (!guildId) throw new ServerOnlyError();

  await guildRepository.insertGuildIfNotExists(guildId);
}
