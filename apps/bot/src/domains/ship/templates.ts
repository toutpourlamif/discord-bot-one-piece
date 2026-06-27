import type { ShipModuleKey } from '@one-piece/db';

type ShipTemplate = {
  label: string;
  description: string;
  // Pas encore d'asset : le rendu `!ship` actuel n'affiche pas de sprite de navire.
  imageUrl: string | null;
  startingLevels: Record<ShipModuleKey, number>;
};

// Le template ne porte QUE l'identité + les niveaux de départ. Les valeurs/coûts par niveau
// restent communs à tous les navires (`SHIP_MODULES`), de même que le cap (niveau 5).
export const SHIP_TEMPLATES = {
  barque: {
    label: 'Barque',
    description: 'Une frêle embarcation de départ. Tout est encore à construire.',
    imageUrl: null,
    startingLevels: { hull: 1, sail: 1, decks: 1, cabins: 1, cargo: 1 },
  },
  'vogue-merry': {
    label: 'Vogue Merry',
    description: "Une caravelle fidèle, premier vrai navire d'un équipage qui débute.",
    imageUrl: null,
    startingLevels: { hull: 2, sail: 2, decks: 2, cabins: 2, cargo: 2 },
  },
  'thousand-sunny': {
    label: 'Thousand Sunny',
    description: 'Un navire de rêve, robuste et rapide, taillé pour le Nouveau Monde.',
    imageUrl: null,
    startingLevels: { hull: 4, sail: 4, decks: 4, cabins: 3, cargo: 4 },
  },
  'red-force': {
    label: 'Red Force',
    description: "Le navire d'un Empereur. Déjà au sommet de ce qu'un bateau peut offrir.",
    imageUrl: null,
    startingLevels: { hull: 5, sail: 5, decks: 5, cabins: 5, cargo: 5 },
  },
} as const satisfies Record<string, ShipTemplate>;

export const DEFAULT_SHIP_TEMPLATE_KEY: ShipTemplateKey = 'barque';

export type ShipTemplateKey = keyof typeof SHIP_TEMPLATES;

export function isShipTemplateKey(key: string): key is ShipTemplateKey {
  return key in SHIP_TEMPLATES;
}

export function getShipTemplate(key: ShipTemplateKey): ShipTemplate {
  return SHIP_TEMPLATES[key];
}
