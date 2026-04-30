type WithDevilFruit = { devilFruitTemplateId: number | null };

/** Retourne par ordre de priorité : le fruit du template, de l'instance, ou null */
export function getCharacterInstanceFruit(template: WithDevilFruit, instance: WithDevilFruit): number | null {
  return template.devilFruitTemplateId ?? instance.devilFruitTemplateId;
}
