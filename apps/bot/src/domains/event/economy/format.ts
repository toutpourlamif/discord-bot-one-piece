export function formatBerry(amount: bigint | number): string {
  return `${Number(amount).toLocaleString('fr-FR')} 💰`;
}
