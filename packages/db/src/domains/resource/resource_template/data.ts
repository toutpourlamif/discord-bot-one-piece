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
] as const satisfies ReadonlyArray<ResourceTemplateInsert>;

export type ResourceName = (typeof RESOURCE_TEMPLATES_DATA)[number]['name'];
