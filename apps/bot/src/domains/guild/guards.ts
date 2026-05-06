import { ServerOnlyError } from './errors.js';

export function requireGuildId(guildId: string | null): string {
  if (!guildId) throw new ServerOnlyError();
  return guildId;
}
