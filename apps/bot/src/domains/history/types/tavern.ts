import type { CoinSide } from '../../tavern/games/coin-flip/types.js';

export type CoinFlipPlayedLog = {
  type: 'tavern.coinFlipPlayed';
  payload: {
    // string car c'est un bigInt; et en jsonb on a que des strings pas de bigint
    betAmount: string;
    chosenSide: CoinSide;
    revealedSide: CoinSide;
    hasWon: boolean;
    balanceDelta: string;
  };
};

export type TavernLog = CoinFlipPlayedLog;
