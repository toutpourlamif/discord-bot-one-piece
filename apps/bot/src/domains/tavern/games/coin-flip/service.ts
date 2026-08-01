import { db } from '@one-piece/db';

import * as economyRepository from '../../../economy/repository.js';
import * as historyRepository from '../../../history/index.js';

import { PAYOUT_MULTIPLIER, WIN_PROBABILITY } from './constants.js';
import type { CoinFlipOutcome, CoinSide } from './types.js';

type ResolveCoinFlipParams = {
  playerId: number;
  betAmount: bigint;
  chosenSide: CoinSide;
};

export async function resolveCoinFlip({ playerId, betAmount, chosenSide }: ResolveCoinFlipParams): Promise<CoinFlipOutcome> {
  const hasWon = roll();
  const revealedSide = hasWon ? chosenSide : getOppositeCoinSide(chosenSide);
  const balanceDelta = hasWon ? betAmount : -betAmount;

  return db.transaction(async (transaction) => {
    const balanceAfterDebit = await economyRepository.debitBerry(playerId, betAmount, transaction);

    const payout = betAmount * PAYOUT_MULTIPLIER;
    const newBalance = hasWon ? await economyRepository.creditBerry(playerId, payout, transaction) : balanceAfterDebit;

    await historyRepository.appendHistory({
      type: 'tavern.coinFlipPlayed',
      payload: {
        betAmount: betAmount.toString(),
        chosenSide,
        revealedSide,
        hasWon,
        balanceDelta: balanceDelta.toString(),
      },
      actorPlayerId: playerId,
      client: transaction,
    });

    return { chosenSide, revealedSide, hasWon, balanceDelta, newBalance };
  });
}

function roll(): boolean {
  return Math.random() < WIN_PROBABILITY;
}

function getOppositeCoinSide(side: CoinSide): CoinSide {
  return side === 'heads' ? 'tails' : 'heads';
}
