import type { PlayerStatKey } from '@one-piece/db';

import { MAGNITUDE_THRESHOLDS, NEUTRAL_LABEL, STAT_MAX, STAT_MIN } from './constants.js';
import { STAT_LABEL_LADDERS } from './label-ladders.js';

type StatPole = 'negative' | 'neutral' | 'positive';

export function getStatRank(statKey: PlayerStatKey, value: number): { pole: StatPole; magnitude: number; pips: string; label: string } {
  const clampedValue = Math.max(STAT_MIN, Math.min(STAT_MAX, value));
  if (clampedValue === 0) return { pole: 'neutral', magnitude: 0, pips: '☆☆☆☆☆', label: NEUTRAL_LABEL };

  const pole: StatPole = clampedValue > 0 ? 'positive' : 'negative';
  const magnitude = MAGNITUDE_THRESHOLDS.findIndex((threshold) => Math.abs(clampedValue) <= threshold) + 1;
  const filledGlyph = pole === 'positive' ? '★' : '✪';
  const pips = filledGlyph.repeat(magnitude) + '☆'.repeat(5 - magnitude);
  const label = STAT_LABEL_LADDERS[statKey][pole][magnitude - 1]!;

  return { pole, magnitude, pips, label };
}
