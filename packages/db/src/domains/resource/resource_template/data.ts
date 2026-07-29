type ResourceSeed = { readonly name: string; readonly path: string | null; readonly description?: string };

export const RESOURCE_TEMPLATES_DATA = [
  // TODO: Voir si on ajoute une ressource par rapport à l'Arbre de mille ans
  {
    name: 'Encyclopédie de Gold Roger',
    path: null,
    description: 'Le journal de bord de Gold Roger, où il a détaillé tout son voyage sur Grand Line.',
    // TODO: Ajouter invendable
  },
  {
    name: 'Canne à pêche',
    path: null,
    // TODO: ajouter invendable
  },
  {
    name: 'Bois',
    path: null,
  },
  {
    name: `Bois d'Adam`,
    path: null,
    description: 'Le bois le plus résistant et précieux du monde, sa vente est illégale, on ne le trouve que sur le marché noir.',
  },
  { name: `Bois d'Ève`, path: null },
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
  { name: 'Eternal Pose - Whisky Peak', path: null },
  { name: 'Eternal Pose - Little Garden', path: null },
  { name: 'Eternal Pose - Drum', path: null },
  { name: 'Eternal Pose - Alabasta', path: null },
  { name: 'Mother Flame', path: null },
] as const satisfies ReadonlyArray<ResourceSeed>;

export type ResourceName = (typeof RESOURCE_TEMPLATES_DATA)[number]['name'];
