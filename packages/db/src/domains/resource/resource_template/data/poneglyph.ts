import type { ResourceSeed } from '../data.js';

export const PONEGLYPH_RESOURCES = [
  {
    name: 'Copie de Road Ponéglyphe',
    path: null,
    description: `Copie d'un Road Ponéglyphe qui contient un point dans le monde. Rassembler les 4 pour trouver Laugh Tale.`,
    isQuestItem: true,
  },
  {
    name: 'Copie de Ponéglyphe Antique',
    path: null,
    description: `Copie d'un Ponéglyphe Antique, lisez le et rassemblez les 9 pour découvrir la Véritable Histoire.`,
    isQuestItem: true,
  }, // TODO: Voir si on implémente le systeme de vol etc = isQuestItem: false
  {
    name: 'Rio Ponéglyphe',
    path: null,
    description: `Vous avez rassemblé tous les Ponéglyphes... lisez l'Histoire, à vos risques et péril.`,
    isQuestItem: true,
  },
] as const satisfies ReadonlyArray<ResourceSeed>;

export type PoneglyphName = (typeof PONEGLYPH_RESOURCES)[number]['name'];

export const PONEGLYPH_NAMES: Array<PoneglyphName> = PONEGLYPH_RESOURCES.map((resource) => resource.name);
