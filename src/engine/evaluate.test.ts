import { describe, expect, it } from 'vitest';
import { evaluateLine, evaluateSpin } from './evaluate';
import { CHERRY_PAIR_MULTIPLIER, THREE_OF_A_KIND } from './paytable';
import { linesForCount, type ReelWindow, type SymbolGrid, type SymbolId } from '../types';

function line(a: SymbolId, b: SymbolId, c: SymbolId): readonly [SymbolId, SymbolId, SymbolId] {
  return [a, b, c];
}

function windowOf(top: SymbolId, middle: SymbolId, bottom: SymbolId): ReelWindow {
  return [top, middle, bottom];
}

function gridOf(reels: readonly [ReelWindow, ReelWindow, ReelWindow]): SymbolGrid {
  return reels;
}

describe('evaluateLine', () => {
  it.each([
    ['cherry', 4],
    ['lemon', 8],
    ['bell', 15],
    ['star', 25],
    ['seven', 50],
    ['diamond', 80],
  ] as const)('pays three %s symbols', (symbol, multiplier) => {
    expect(evaluateLine(line(symbol, symbol, symbol))).toEqual({
      symbol,
      count: 3,
      multiplier,
    });
  });

  it('pays three wilds as wild, not as every symbol at once', () => {
    expect(evaluateLine(line('wild', 'wild', 'wild'))).toEqual({
      symbol: 'wild',
      count: 3,
      multiplier: THREE_OF_A_KIND.wild,
    });
  });

  it.each([
    ['wild', 'wild', 'cherry'],
    ['cherry', 'wild', 'cherry'],
    ['wild', 'cherry', 'wild'],
  ] as const)('lets wilds complete three cherries %#', (a, b, c) => {
    expect(evaluateLine(line(a, b, c))).toEqual({
      symbol: 'cherry',
      count: 3,
      multiplier: THREE_OF_A_KIND.cherry,
    });
  });

  it('lets wilds complete three diamonds', () => {
    expect(evaluateLine(line('wild', 'diamond', 'wild'))).toEqual({
      symbol: 'diamond',
      count: 3,
      multiplier: THREE_OF_A_KIND.diamond,
    });
  });

  it('pays two natural cherries', () => {
    expect(evaluateLine(line('cherry', 'lemon', 'cherry'))).toEqual({
      symbol: 'cherry',
      count: 2,
      multiplier: CHERRY_PAIR_MULTIPLIER,
    });
  });

  it('lets one wild stand in for the cherry pair', () => {
    expect(evaluateLine(line('cherry', 'wild', 'lemon'))).toEqual({
      symbol: 'cherry',
      count: 2,
      multiplier: CHERRY_PAIR_MULTIPLIER,
    });
  });

  it('does not also pay the pair when wilds already made three of a kind', () => {
    expect(evaluateLine(line('cherry', 'cherry', 'wild'))?.count).toBe(3);
    expect(evaluateLine(line('wild', 'wild', 'lemon'))).toEqual({
      symbol: 'lemon',
      count: 3,
      multiplier: THREE_OF_A_KIND.lemon,
    });
  });

  it('pays nothing for a losing mix', () => {
    expect(evaluateLine(line('cherry', 'lemon', 'bell'))).toBeNull();
    expect(evaluateLine(line('lemon', 'lemon', 'bell'))).toBeNull();
    expect(evaluateLine(line('wild', 'lemon', 'bell'))).toBeNull();
    expect(evaluateLine(line('cherry', 'bell', 'star'))).toBeNull();
  });

  it('does not pay a pair of anything except cherries', () => {
    expect(evaluateLine(line('lemon', 'star', 'lemon'))).toBeNull();
    expect(evaluateLine(line('seven', 'seven', 'bell'))).toBeNull();
  });
});

describe('evaluateSpin', () => {
  const priced = gridOf([
    windowOf('cherry', 'lemon', 'cherry'),
    windowOf('cherry', 'bell', 'lemon'),
    windowOf('cherry', 'star', 'cherry'),
  ]);

  it('returns no win when the only active line misses', () => {
    const result = evaluateSpin(priced, linesForCount(1), 10);
    expect(result.wins).toEqual([]);
    expect(result.totalWin).toBe(0);
  });

  it('ignores winning rows that are not on an active line', () => {
    const topCherries = gridOf([
      windowOf('cherry', 'lemon', 'bell'),
      windowOf('cherry', 'star', 'seven'),
      windowOf('cherry', 'diamond', 'lemon'),
    ]);
    expect(evaluateSpin(topCherries, linesForCount(1), 10).totalWin).toBe(0);
    expect(evaluateSpin(topCherries, linesForCount(5), 10).totalWin).toBe(40);
  });

  it('stacks every paying line and scales by the line bet', () => {
    const result = evaluateSpin(priced, linesForCount(5), 10);
    const byLine = Object.fromEntries(result.wins.map((win) => [win.lineId, win.amount]));
    expect(byLine).toEqual({
      top: 40,
      bottom: 10,
      diagDown: 10,
      diagUp: 10,
    });
    expect(result.totalWin).toBe(70);
    expect(evaluateSpin(priced, linesForCount(5), 20).totalWin).toBe(140);
  });

  it('rejects a stake that is not a positive integer', () => {
    expect(() => evaluateSpin(priced, linesForCount(1), 0)).toThrow(/lineBet/);
  });
});
