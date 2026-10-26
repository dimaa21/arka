import type { SymbolId } from '../types';

/**
 * How often each symbol is placed on a reel. The total is 100, so a weight is
 * also the percentage of stops that show that symbol.
 */
export const SYMBOL_WEIGHTS = {
  cherry: 25,
  lemon: 22,
  bell: 18,
  star: 14,
  seven: 10,
  diamond: 7,
  wild: 4,
} as const satisfies Readonly<Record<SymbolId, number>>;

/** Multiplier of the line bet for three of a kind. Wild is the top prize. */
export const THREE_OF_A_KIND = {
  cherry: 4,
  lemon: 8,
  bell: 15,
  star: 25,
  seven: 50,
  diamond: 80,
  wild: 200,
} as const satisfies Readonly<Record<SymbolId, number>>;

/** Paid when a line has exactly two cherries and wilds did not complete a triple. */
export const CHERRY_PAIR_MULTIPLIER = 1;

export const SYMBOL_LABEL = {
  cherry: 'Cherry',
  lemon: 'Lemon',
  bell: 'Bell',
  star: 'Star',
  seven: 'Seven',
  diamond: 'Diamond',
  wild: 'Wild',
} as const satisfies Readonly<Record<SymbolId, string>>;

/** Sum of {@link SYMBOL_WEIGHTS}. A full reel strip has this many stops. */
export function weightTotal(weights: Readonly<Record<SymbolId, number>> = SYMBOL_WEIGHTS): number {
  return Object.values(weights).reduce((sum, weight) => sum + weight, 0);
}
