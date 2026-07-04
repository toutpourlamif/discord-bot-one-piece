export const TAVERN_BUTTON_NAME = 'tavern';
export const TAVERN_SECTION_BUTTON_NAME = 'tavern-section';
export const TAVERN_GAME_BUTTON_NAME = 'tavern-game';

export type TavernSection = 'talk' | 'games' | 'shop' | 'recruit';

export const TAVERN_SECTIONS: Record<TavernSection, { label: string; emoji: string }> = {
  talk: { label: 'Parler au tavernier', emoji: '💬' },
  games: { label: 'Espace jeux', emoji: '🎲' },
  shop: { label: 'Boutique', emoji: '🛒' },
  recruit: { label: 'Recruter', emoji: '⚓' },
};
