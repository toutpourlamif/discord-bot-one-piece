import { MULTIPLE_SPACES_REGEX } from './constants.js';

const DISCORD_FORMATTING_CHARS_REGEX = /[*_`~|><@/"[\]()\\]/g;

export function sanitizeName(name: string): string {
  return name.replace(DISCORD_FORMATTING_CHARS_REGEX, '').replace(MULTIPLE_SPACES_REGEX, ' ').trim();
}
