import { ETERNAL_POSE_RESOURCES } from './data/eternal-poses.js';

export type ResourceSeed = {
  readonly name: string;
  readonly path: string | null;
  readonly description?: string;
  readonly isQuestItem?: boolean;
};

export const RESOURCE_TEMPLATES_DATA = [
  // TODO: Voir si on ajoute une ressource par rapport à l'Arbre de mille ans
  {
    name: 'Encyclopédie de Gold Roger',
    path: null,
    description: 'Le journal de bord de Gold Roger, où il a détaillé tout son voyage sur Grand Line.',
    isQuestItem: true,
  },
  {
    name: 'Canne à pêche',
    path: null,
    description: "Une canne à pêche toute simple, offerte par un vieux marin au début de l'aventure.",
    isQuestItem: true,
  },
  {
    name: 'Bois',
    path: null,
  },
  {
    name: `Bois d'Adam`,
    path: null,
    description: 'Le bois le plus résistant et précieux du monde, sa vente est illégale, on ne le trouve que sur le marché noir.',
    isQuestItem: true,
  },
  { name: `Bois d'Ève`, path: null, isQuestItem: true },
  {
    name: 'Fer',
    path: null,
  },
  { name: 'Granit Marin', path: null },
  { name: 'Wootz', path: null },
  { name: `Minerai d'Eau de Vie`, path: null },
  { name: 'Wapométal', path: null },
  { name: 'Tissu', path: null },
  { name: 'Cola', path: null },
  { name: 'Résine', path: null },
  { name: 'Log Pose', path: null },
  ...ETERNAL_POSE_RESOURCES,
  { name: 'Mother Flame', path: null },
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
] as const satisfies ReadonlyArray<ResourceSeed>;

export type ResourceName = (typeof RESOURCE_TEMPLATES_DATA)[number]['name'];
