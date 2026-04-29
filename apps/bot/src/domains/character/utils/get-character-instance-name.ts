/** Le nickname (s'il existe) prend le pas sur le nom du template. Utilisé pour afficher le perso as character. */
export function getCharacterInstanceName(row: { name: string; nickname: string | null }): string {
  return row.nickname ?? row.name;
}
