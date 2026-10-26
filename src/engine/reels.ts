import { SYMBOL_WEIGHTS } from './paytable';
import { createRng, mod, nextInt, type Rng } from './rng';
import type { ReelSet, ReelWindow, RowIndex, SymbolId } from '../types';

/** Fixed seed so every session uses the same strip layout and the published RTP matches. */
export const REEL_LAYOUT_SEED = 20261026;

/**
 * Build one reel strip with exactly `weights[symbol]` copies of each symbol,
 * then shuffle it with the supplied RNG.
 */
export function buildStrip(weights: Readonly<Record<SymbolId, number>>, rng: Rng): SymbolId[] {
  const strip: SymbolId[] = [];
  const entries = Object.entries(weights) as [SymbolId, number][];
  for (const [symbol, count] of entries) {
    if (!Number.isInteger(count) || count < 0) {
      throw new Error(`weight for ${symbol} must be a non-negative integer`);
    }
    for (let copy = 0; copy < count; copy += 1) strip.push(symbol);
  }
  if (strip.length === 0) throw new Error('reel strip is empty');
  shuffle(strip, rng);
  return strip;
}

/** Three strips dealt from one RNG, so the reels differ but stay reproducible. */
export function createReelSet(
  rng: Rng,
  weights: Readonly<Record<SymbolId, number>> = SYMBOL_WEIGHTS,
): ReelSet {
  return [buildStrip(weights, rng), buildStrip(weights, rng), buildStrip(weights, rng)];
}

/** The reel layout shipped with the game. */
export function createDefaultReelSet(): ReelSet {
  return createReelSet(createRng(REEL_LAYOUT_SEED));
}

/**
 * Strip index visible on a row when the reel is parked on `stop`.
 * `stop` itself sits on the middle row. Increasing the stop moves symbols downward,
 * so the symbol above the middle is `stop + 1`.
 */
export function indexAtRow(stop: number, row: RowIndex): number {
  if (row === 0) return stop + 1;
  if (row === 1) return stop;
  return stop - 1;
}

/** Top, middle, and bottom symbols for a reel parked on `stop`. */
export function readWindow(strip: readonly SymbolId[], stop: number): ReelWindow {
  return [
    stripAt(strip, indexAtRow(stop, 0)),
    stripAt(strip, indexAtRow(stop, 1)),
    stripAt(strip, indexAtRow(stop, 2)),
  ];
}

/** Read a strip with wrap-around. Negative indexes are allowed. */
export function stripAt(strip: readonly SymbolId[], index: number): SymbolId {
  if (strip.length === 0) throw new Error('reel strip is empty');
  const symbol = strip[mod(index, strip.length)];
  if (symbol === undefined) throw new Error('reel strip index is empty');
  return symbol;
}

/** Choose a uniform stop on each reel. The caller evaluates this before animating. */
export function pickStops(strips: ReelSet, rng: Rng): readonly [number, number, number] {
  return [
    nextInt(rng, strips[0].length),
    nextInt(rng, strips[1].length),
    nextInt(rng, strips[2].length),
  ];
}

/** Build the visible grid for stops that were already chosen. */
export function gridFromStops(
  strips: ReelSet,
  stops: readonly [number, number, number],
): readonly [ReelWindow, ReelWindow, ReelWindow] {
  return [
    readWindow(strips[0], stops[0]),
    readWindow(strips[1], stops[1]),
    readWindow(strips[2], stops[2]),
  ];
}

function shuffle(items: SymbolId[], rng: Rng): void {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = nextInt(rng, index + 1);
    const current = items[index];
    const other = items[swapIndex];
    if (current === undefined || other === undefined) throw new Error('shuffle index out of range');
    items[index] = other;
    items[swapIndex] = current;
  }
}
