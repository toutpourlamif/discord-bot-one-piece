/** Couleurs de la carte du monde, partagées entre le fond de carte du bot et le rendu dev `pnpm world`. */
export const WORLD_MAP_COLORS = {
  ocean: '#1e5b8a',
  // Dégradé + haut-fonds du fond de carte (le rendu cytoscape garde le `ocean` uni).
  oceanLight: '#2b6f9e',
  oceanDeep: '#143d61',
  shallows: '#bfe3ff',
  cloud: '#e8f1fa',
  island: '#c9a37c',
  islandBorder: '#fff7d6',
  label: '#f8fafc',
  labelOutline: '#172033',
  edge: '#e2e8f0',
  requirementEdge: '#fbbf24',
  regionFill: '#bfdbfe',
  regionBorder: '#dbeafe',
} as const;
