import { ETERNAL_POSE_RESOURCES } from './data/eternal-poses.js';
import { PONEGLYPH_RESOURCES } from './data/poneglyph.js';

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
  ...PONEGLYPH_RESOURCES,
] as const satisfies ReadonlyArray<ResourceSeed>;

export type ResourceName = (typeof RESOURCE_TEMPLATES_DATA)[number]['name'];
