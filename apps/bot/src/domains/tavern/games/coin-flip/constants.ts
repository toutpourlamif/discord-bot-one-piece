import type { TavernGameId } from '@one-piece/db';

import type { CoinSide } from './types.js';

export const COIN_FLIP_GAME_ID: TavernGameId = 'coin-flip';

export const COIN_FLIP_BET_MODAL_NAME = 'coin-flip-bet';
export const COIN_FLIP_PLAY_BUTTON_NAME = 'coin-flip-play';

/** Id du champ texte du modal de mise (lu via `interaction.fields.getTextInputValue`). */
export const BET_AMOUNT_FIELD_ID = 'bet-amount';

/** 0.48 car la maison l'emporte toujours =) */
export const WIN_PROBABILITY = 0.48;

export const MULTIPLIER_IF_WIN = 2n;

/** Animation générique (tous taverniers) du jet de pièce, jouée entre le choix et la révélation. */
export const COIN_FLIP_THROW_ANIMATION = {
  path: 'tavern/coin-flip-throw.webp',
  durationMs: 6_000,
} as const;

export const COIN_SIDES: Record<CoinSide, { label: string; emoji: string }> = {
  tails: { label: 'Pile', emoji: '🪙' },
  heads: { label: 'Face', emoji: '👑' },
};
