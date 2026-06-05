import type { TavernActivityType } from '@one-piece/db';

export const TAVERN_BUTTON_NAME = 'tavern';
export const TAVERN_SECTION_BUTTON_NAME = 'tavern-section';

export type TavernSection = 'barkeep' | 'games' | 'shop' | 'recruit';

export const TAVERN_SECTION_LABELS: Record<TavernSection, string> = {
  barkeep: 'Tavernier',
  games: 'Espace jeux',
  shop: 'Boutique',
  recruit: 'Recruter',
};

export const TAVERN_SECTION_EMOJIS: Record<TavernSection, string> = {
  barkeep: '🍺',
  games: '🎲',
  shop: '🛒',
  recruit: '⚓',
};

// Une activité de l'île pointe vers la section de menu qui la regroupe.
export const TAVERN_ACTIVITY_SECTION: Record<TavernActivityType, TavernSection> = {
  shop: 'shop',
  recruit: 'recruit',
  blackjack: 'games',
  'juste-prix': 'games',
};
