/**  SI un string dépasse `max` length, alors il est coupé à partir du `max`ème caractère, et on ajoute ...
 * Exemple si max=3, 'rayan' => 'ray…'
 */
export function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

/** Entoure `value` d'un bloc de code Discord (```lang\n...\n```). `lang` sert à la coloration syntaxique (ex: 'json', 'ts'). */
export function wrapInCodeBlock(value: string, lang = ''): string {
  return `\`\`\`${lang}\n${value}\n\`\`\``;
}

/** Retourne n (`count`) marques invisibles suivies d'un espace, pour simuler une indentation dans un embed (car Discord enleve les espaces en début de ligne). */
export function buildInvisibleIndent(count: number): string {
  return '‎ '.repeat(count);
}
