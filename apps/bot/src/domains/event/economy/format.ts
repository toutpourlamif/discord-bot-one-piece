export function formatBerry(amount: bigint | number): string {
  return `${amount.toLocaleString('fr-FR')} 💰`;
}
