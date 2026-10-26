import { describe, expect, it } from 'vitest';
import { createRng, nextInt } from './rng';

describe('createRng', () => {
  it('repeats the same sequence for a seed', () => {
    const first = createRng(42);
    const second = createRng(42);
    const sequence = () => [first(), first(), first(), first(), first()];
    expect(sequence()).toEqual([second(), second(), second(), second(), second()]);
  });

  it('stays inside [0, 1)', () => {
    const rng = createRng(1);
    for (let index = 0; index < 1000; index += 1) {
      const value = rng();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('diverges for a different seed', () => {
    const first = createRng(1);
    const second = createRng(2);
    const left = [first(), first(), first(), first()];
    const right = [second(), second(), second(), second()];
    expect(left).not.toEqual(right);
  });
});

describe('nextInt', () => {
  it('returns integers in range', () => {
    const rng = createRng(99);
    for (let index = 0; index < 500; index += 1) {
      const value = nextInt(rng, 7);
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(7);
    }
  });

  it('is zero when the range has one value', () => {
    const rng = createRng(5);
    expect(nextInt(rng, 1)).toBe(0);
  });

  it('rejects an empty range', () => {
    expect(() => nextInt(createRng(1), 0)).toThrow(/positive integer/);
  });
});
