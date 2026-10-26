import { describe, expect, it } from 'vitest';
import { SYMBOL_WEIGHTS, weightTotal } from './paytable';
import {
  buildStrip,
  createDefaultReelSet,
  createReelSet,
  indexAtRow,
  readWindow,
  stripAt,
} from './reels';
import { createRng, nextInt } from './rng';
import { resolveRound } from './spin';
import { linesForCount, SYMBOLS, type SymbolId } from '../types';

function emptyCounts(): Record<SymbolId, number> {
  return {
    cherry: 0,
    lemon: 0,
    bell: 0,
    star: 0,
    seven: 0,
    diamond: 0,
    wild: 0,
  };
}

describe('reel strips', () => {
  it('contains each symbol exactly as often as its weight', () => {
    const strip = buildStrip(SYMBOL_WEIGHTS, createRng(7));
    const counts = emptyCounts();
    for (const symbol of strip) counts[symbol] += 1;
    expect(strip).toHaveLength(weightTotal());
    expect(counts).toEqual(SYMBOL_WEIGHTS);
  });

  it('shuffles deterministically and does not leave the symbols in weight order', () => {
    const first = buildStrip(SYMBOL_WEIGHTS, createRng(7));
    const second = buildStrip(SYMBOL_WEIGHTS, createRng(7));
    const third = buildStrip(SYMBOL_WEIGHTS, createRng(8));
    expect(first).toEqual(second);
    expect(first).not.toEqual(third);
    const grouped = SYMBOLS.flatMap((symbol) =>
      Array<SymbolId>(SYMBOL_WEIGHTS[symbol]).fill(symbol),
    );
    expect(first).not.toEqual(grouped);
  });

  it('gives the middle row the weight distribution across every stop', () => {
    const strip = buildStrip(SYMBOL_WEIGHTS, createRng(7));
    const counts = emptyCounts();
    for (let stop = 0; stop < strip.length; stop += 1) {
      counts[readWindow(strip, stop)[1]] += 1;
    }
    expect(counts).toEqual(SYMBOL_WEIGHTS);
  });

  it('samples stops in proportion to the weights', () => {
    const strip = buildStrip(SYMBOL_WEIGHTS, createRng(7));
    const rng = createRng(99);
    const counts = emptyCounts();
    const samples = 20_000;
    for (let index = 0; index < samples; index += 1) {
      counts[readWindow(strip, nextInt(rng, strip.length))[1]] += 1;
    }
    for (const symbol of SYMBOLS) {
      const expected = (SYMBOL_WEIGHTS[symbol] / weightTotal()) * samples;
      expect(Math.abs(counts[symbol] - expected)).toBeLessThan(expected * 0.15 + 40);
    }
  });

  it('wraps the window around the ends of the strip', () => {
    const strip = buildStrip(SYMBOL_WEIGHTS, createRng(3));
    const window = readWindow(strip, 0);
    expect(window[1]).toBe(stripAt(strip, 0));
    expect(window[0]).toBe(stripAt(strip, 1));
    expect(window[2]).toBe(stripAt(strip, -1));
    expect(indexAtRow(4, 0)).toBe(5);
    expect(indexAtRow(4, 1)).toBe(4);
    expect(indexAtRow(4, 2)).toBe(3);
  });

  it('builds three different strips from the shared layout seed', () => {
    const reels = createDefaultReelSet();
    expect(reels[0]).not.toEqual(reels[1]);
    expect(reels[1]).not.toEqual(reels[2]);
    expect(createDefaultReelSet()).toEqual(reels);
  });
});

describe('resolveRound', () => {
  it('is reproducible and agrees with the strip windows', () => {
    const strips = createReelSet(createRng(4));
    const first = resolveRound(strips, createRng(5), linesForCount(1), 10);
    const second = resolveRound(strips, createRng(5), linesForCount(1), 10);
    expect(first).toEqual(second);
    expect(first.grid[0][1]).toBe(stripAt(strips[0], first.stops[0]));
    expect(first.grid[1][1]).toBe(stripAt(strips[1], first.stops[1]));
    expect(first.grid[2][1]).toBe(stripAt(strips[2], first.stops[2]));
  });
});
