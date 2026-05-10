import { DISCORD_FORMATTING_CHARS_REGEX } from '../discord/constants.js';

const MULTIPLE_SPACES = /\s+/g;

export function sanitizeName(name: string): string {
  return name.replace(DISCORD_FORMATTING_CHARS_REGEX, '').replace(MULTIPLE_SPACES, ' ').trim();
}
