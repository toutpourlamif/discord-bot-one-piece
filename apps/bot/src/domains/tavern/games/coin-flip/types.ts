export type CoinSide = 'heads' | 'tails';

export type CoinFlipOutcome = {
  chosenSide: CoinSide;
  revealedSide: CoinSide;
  hasWon: boolean;
  /** Variation de solde due à cette manche : +mise si gagné, -mise si perdu. */
  balanceDelta: bigint;
  newBalance: bigint;
};
