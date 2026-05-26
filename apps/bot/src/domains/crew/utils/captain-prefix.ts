import type { CharacterRow } from '../../character/types.js';
import { getCharacterInstanceName } from '../../character/utils/get-character-instance-name.js';

export function formatLine(row: CharacterRow): string {
  const prefix = row.isCaptain ? '⭐ ' : '';
  return `${prefix}${getCharacterInstanceName(row)}`;
}
