/**
 * Le nickname (s'il existe) prend le pas sur le nom du template. Utilisé pour afficher le perso as character.
 * Le template perso d'un joueur a `name: null`, mais son instance porte toujours un nickname.
 */
export function getCharacterInstanceName(row: { name: string | null; nickname: string | null }): string {
  const name = row.nickname ?? row.name;
  if (!name) throw new Error('character_instance sans nickname ni nom de template');
  return name;
}
