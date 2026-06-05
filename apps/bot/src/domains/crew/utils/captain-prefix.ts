import type { CharacterRow } from '../../character/types.js';

export function formatLine(row: CharacterRow): string {
  const prefix = row.isCaptain ? '⭐ ' : '';
  return `${prefix}${row.name}`;
}
