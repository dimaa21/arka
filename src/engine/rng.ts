export type Rng = () => number;

/**
 * Mulberry32 generator. The same seed always replays the same sequence,
 * which keeps tests and the `?seed=` debug mode reproducible.
 * @returns Floats in the half-open range [0, 1).
 */
export function createRng(seed: number): Rng {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Unbiased-enough integer in `[0, max)`.
 * `max` must be a positive integer. The float multiply has a tiny modulo bias
 * that does not matter for reel strips of this size.
 */
export function nextInt(rng: Rng, max: number): number {
  if (!Number.isInteger(max) || max <= 0) {
    throw new Error('max must be a positive integer');
  }
  return Math.floor(rng() * max);
}

/** Positive modulo that also accepts negative indexes. */
export function mod(value: number, length: number): number {
  if (length <= 0) throw new Error('length must be positive');
  return ((value % length) + length) % length;
}
