import * as guildRepository from './repository.js';

export async function ensureGuildExists(guildId: string): Promise<void> {
  await guildRepository.insertGuildIfNotExists(guildId);
}
