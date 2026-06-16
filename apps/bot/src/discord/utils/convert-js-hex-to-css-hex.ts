/** Transforme un héxadécimal JS en héxadécimal CSS
 * Exemple : 0xffffff=> #FFFFFF)*/
export function convertJsHexToCssHex(color: number): string {
  return `#${color.toString(16).padStart(6, '0').toUpperCase()}`;
}
