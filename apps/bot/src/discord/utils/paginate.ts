import { DISCORD_EMBED_DESCRIPTION_MAX_LENGTH } from '../constants.js';

// TODO: SPLIT ce fichier en deux fichiers, ou alors en un dossier paginate et deux fichiers

/** Regroupe une liste de lignes en pages, sans qu'aucune page ne dépasse `maxLength` caractères (les `\n` entre lignes comptent).
 * Exemple : 200 lignes "Bois — 5" → ["ligne à ligne80", "ligne81 à ligne160", "ligne161 à ligne200"]. */
export function splitIntoPages(lines: Array<string>, maxLength: number = DISCORD_EMBED_DESCRIPTION_MAX_LENGTH): Array<string> {
  if (lines.length === 0) return [];

  const pages: Array<string> = [];
  let current: Array<string> = [];
  let currentLength = 0;

  for (const line of lines) {
    const separatorLength = current.length > 0 ? 1 : 0;
    const nextLength = currentLength + separatorLength + line.length;
    if (current.length > 0 && nextLength > maxLength) {
      pages.push(current.join('\n'));
      current = [];
      currentLength = 0;
    }
    current.push(line);
    currentLength += (current.length > 1 ? 1 : 0) + line.length;
  }

  if (current.length > 0) pages.push(current.join('\n'));
  return pages;
}

/** Clamp `page` entre 0 (inclus) et `pageCount - 1` (inclus).
 * Exemple sur `[0, 3]` : `-1 → 0`, `4 → 3`, `1 → 1`. */
export function clampPage(page: number, pageCount: number): number {
  return Math.min(Math.max(page, 0), pageCount - 1);
}
