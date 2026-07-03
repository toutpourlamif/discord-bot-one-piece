import { db } from '@one-piece/db';

import { ValidationError } from '../../../../discord/errors.js';
import * as economyRepository from '../../../economy/repository.js';
import * as historyRepository from '../../../history/index.js';

import { MULTIPLIER_IF_WIN, WIN_PROBABILITY } from './constants.js';
import type { CoinFlipOutcome, CoinSide } from './types.js';

type ResolveCoinFlipParams = {
  playerId: number;
  betAmount: bigint;
  chosenSide: CoinSide;
};

export async function resolveCoinFlip({ playerId, betAmount, chosenSide }: ResolveCoinFlipParams): Promise<CoinFlipOutcome> {
  assertBetIsPositive(betAmount);

  return db.transaction(async (transaction) => {
    const balanceAfterDebit = await economyRepository.debitBerry(playerId, betAmount, transaction);

    const hasWon = roll();
    const revealedSide = hasWon ? chosenSide : getOppositeCoinSide(chosenSide);
    const balanceDelta = hasWon ? betAmount : -betAmount;

    const payout = betAmount * MULTIPLIER_IF_WIN;
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

function assertBetIsPositive(betAmount: bigint): void {
  if (betAmount <= 0n) throw new ValidationError('La mise doit être supérieure à 0.');
}

function roll(): boolean {
  return Math.random() < WIN_PROBABILITY;
}

function getOppositeCoinSide(side: CoinSide): CoinSide {
  return side === 'heads' ? 'tails' : 'heads';
}
