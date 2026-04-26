const DISCORD_FORMATTING_CHARS = /[*_`~|><@/"[\]()\\]/g;
const MULTIPLE_SPACES = /\s+/g;

export function sanitizeName(name: string): string {
  return name.replace(DISCORD_FORMATTING_CHARS, '').replace(MULTIPLE_SPACES, ' ').trim();
}
