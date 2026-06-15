export const TAVERN_BUTTON_NAME = 'tavern';
export const TAVERN_SECTION_BUTTON_NAME = 'tavern-section';

export type TavernSection = 'barkeep' | 'games' | 'shop' | 'recruit';

export const TAVERN_SECTIONS: Record<TavernSection, { label: string; emoji: string }> = {
  barkeep: { label: 'Tavernier', emoji: '🍺' },
  games: { label: 'Espace jeux', emoji: '🎲' },
  shop: { label: 'Boutique', emoji: '🛒' },
  recruit: { label: 'Recruter', emoji: '⚓' },
};
