import { BERRY_SYMBOL } from '../constants.js';

export function formatBerry(amount: bigint | number): string {
  return `${amount.toLocaleString('fr-FR')} ${BERRY_SYMBOL}`;
}
