import { describe, expect, it } from 'vitest';
import { indexAtRow } from '../engine/reels';
import { rowCenterY, symbolCenterY } from './geometry';

describe('symbol geometry', () => {
  it('parks each window row on the strip index the engine reads', () => {
    const reelTop = 40;
    const cellH = 50;
    const middleY = rowCenterY(reelTop, cellH, 1);
    const stop = 8;
    for (const row of [0, 1, 2] as const) {
      const y = symbolCenterY(middleY, cellH, stop, indexAtRow(stop, row));
      expect(y).toBe(rowCenterY(reelTop, cellH, row));
    }
  });
});
