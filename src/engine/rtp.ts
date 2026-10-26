import { evaluateLine } from './evaluate';
import { SYMBOL_WEIGHTS } from './paytable';
import { SYMBOLS, type SymbolId } from '../types';

/**
 * Exact single-line return, as a fraction of the line bet (0.96 means 96%).
 *
 * Each reel stop is uniform on a strip that contains {@link SYMBOL_WEIGHTS}
 * copies of each symbol, and the three reels are independent, so this is the
 * theoretical RTP of every individual payline. Playing five lines scales the
 * stake and the expected return by the same factor, so the RTP is unchanged.
 */
export function theoreticalLineRtp(
  weights: Readonly<Record<SymbolId, number>> = SYMBOL_WEIGHTS,
): number {
  const stats = enumerate(weights);
  return stats.returned / stats.stake;
}

/** Chance that a single line pays anything. */
export function theoreticalLineHitRate(
  weights: Readonly<Record<SymbolId, number>> = SYMBOL_WEIGHTS,
): number {
  const stats = enumerate(weights);
  return stats.hits / stats.stake;
}

function enumerate(weights: Readonly<Record<SymbolId, number>>): {
  stake: number;
  returned: number;
  hits: number;
} {
  let stake = 0;
  let returned = 0;
  let hits = 0;
  for (const a of SYMBOLS) {
    for (const b of SYMBOLS) {
      for (const c of SYMBOLS) {
        const ways = weightOf(weights, a) * weightOf(weights, b) * weightOf(weights, c);
        stake += ways;
        const match = evaluateLine([a, b, c]);
        if (!match) continue;
        hits += ways;
        returned += ways * match.multiplier;
      }
    }
  }
  if (stake === 0) throw new Error('symbol weights are empty');
  return { stake, returned, hits };
}

function weightOf(weights: Readonly<Record<SymbolId, number>>, symbol: SymbolId): number {
  return weights[symbol];
}
