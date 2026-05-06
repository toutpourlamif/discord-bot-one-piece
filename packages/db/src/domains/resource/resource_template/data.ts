import type { ResourceTemplateInsert } from './schema.js';

export const RESOURCE_TEMPLATES_DATA = [
  {
    name: 'Bois',
    imageUrl: null,
  },
  {
    name: 'Fer',
    imageUrl: null,
  },
  { name: 'Log Pose', imageUrl: null },
  { name: 'Eternal Pose - Whisky Peak', imageUrl: null },
  { name: 'Eternal Pose - Little Garden', imageUrl: null },
  { name: 'Eternal Pose - Drum', imageUrl: null },
  { name: 'Eternal Pose - Alabasta', imageUrl: null },
] as const satisfies ReadonlyArray<ResourceTemplateInsert>;

export type ResourceName = (typeof RESOURCE_TEMPLATES_DATA)[number]['name'];
