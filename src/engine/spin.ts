import { evaluateSpin } from './evaluate';
import { gridFromStops, pickStops } from './reels';
import type { Rng } from './rng';
import type { Evaluation, Payline, ReelSet, SymbolGrid } from '../types';

/** Outcome of one spin. Produced in full before any reel animation starts. */
export interface RoundResult {
  readonly stops: readonly [number, number, number];
  readonly grid: SymbolGrid;
  readonly evaluation: Evaluation;
}

/**
 * Draw stops, read the windows, and price the active lines.
 * Animation may only display `stops`; it does not draw a new outcome.
 */
export function resolveRound(
  strips: ReelSet,
  rng: Rng,
  lines: readonly Payline[],
  lineBet: number,
): RoundResult {
  const stops = pickStops(strips, rng);
  const grid = gridFromStops(strips, stops);
  return {
    stops,
    grid,
    evaluation: evaluateSpin(grid, lines, lineBet),
  };
}
