import type { Character } from '../../character/types.js';

export function formatLine(row: Character): string {
  const prefix = row.isCaptain ? '⭐ ' : '';
  return `${prefix}${row.name}`;
}
