/**  SI un string dépasse `max` length, alors il est coupé à partir du `max`ème caractère, et on ajoute ...
 * Exemple si max=3, 'rayan' => 'ray…'
 */
export function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

export function wrapInCodeBlock(value: string, lang = ''): string {
  return `\`\`\`${lang}\n${value}\n\`\`\``;
}
