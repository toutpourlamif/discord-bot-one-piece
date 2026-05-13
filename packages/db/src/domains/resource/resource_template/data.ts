type ResourceSeed = { readonly name: string; readonly imageUrl: string | null };

export const RESOURCE_TEMPLATES_DATA = [
  // TODO: Voir si on ajoute une ressource par rapport à l'Arbre de mille ans
  {
    name: 'Bois',
    imageUrl: null,
  },
  {
    name: `Bois d'Adam`, // Le bois le plus résistant et précieux du monde, sa vente est illégale, on ne le trouve que sur le marché noir.
    imageUrl: null,
  },
  { name: `Bois d'Ève`, imageUrl: null },
  {
    name: 'Fer',
    imageUrl: null,
  },
  { name: 'Granit Marin', imageUrl: null },
  { name: 'Wootz', imageUrl: null },
  { name: `Minerai d'Eau de Vie`, imageUrl: null },
  { name: 'Wapométal', imageUrl: null },
  { name: 'Tissu', imageUrl: null },
  { name: 'Cola', imageUrl: null },
  { name: 'Résine', imageUrl: null },
  { name: 'Log Pose', imageUrl: null },
  { name: 'Eternal Pose - Whisky Peak', imageUrl: null },
  { name: 'Eternal Pose - Little Garden', imageUrl: null },
  { name: 'Eternal Pose - Drum', imageUrl: null },
  { name: 'Eternal Pose - Alabasta', imageUrl: null },
  { name: 'Mother Flame', imageUrl: null },
] as const satisfies ReadonlyArray<ResourceSeed>;

export type ResourceName = (typeof RESOURCE_TEMPLATES_DATA)[number]['name'];
