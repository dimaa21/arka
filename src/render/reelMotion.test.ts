import { describe, expect, it } from 'vitest';
import { createDefaultReelSet } from '../engine/reels';
import { ReelAnimator } from './reelMotion';

const options = { fast: false, reducedMotion: false } as const;

function settle(animator: ReelAnimator): number {
  let frames = 0;
  while (!animator.isSettled()) {
    animator.update(1 / 60);
    frames += 1;
    if (frames > 8_000) throw new Error('reel spin did not settle');
  }
  return frames;
}

describe('ReelAnimator', () => {
  it('lands on the stops that were chosen before the spin', () => {
    const animator = new ReelAnimator([100, 100, 100]);
    animator.spin([3, 10, 25], options);
    let sawStopping = false;
    let frames = 0;
    while (!animator.isSettled()) {
      if (animator.isStopping()) sawStopping = true;
      animator.update(1 / 60);
      frames += 1;
      if (frames > 8_000) throw new Error('reel spin did not settle');
    }
    expect(sawStopping).toBe(true);
    expect(frames).toBeGreaterThan(40);
    expect(frames).toBeLessThan(700);
    expect(animator.middleIndex(0)).toBe(3);
    expect(animator.middleIndex(1)).toBe(10);
    expect(animator.middleIndex(2)).toBe(25);
    expect(animator.maxLandingError).toBeLessThan(0.02);
    expect(animator.views()[0].bounce).toBe(0);
    expect(animator.views()[0].motion).toBe(0);
  });

  it('ignores a second spin until the first one has landed', () => {
    const animator = new ReelAnimator([80, 80, 80]);
    animator.spin([4, 5, 6], options);
    animator.update(1 / 60);
    animator.spin([11, 12, 13], options);
    settle(animator);
    expect(animator.middleIndex(0)).toBe(4);
    expect(animator.middleIndex(1)).toBe(5);
    expect(animator.middleIndex(2)).toBe(6);
  });

  it('can spin again from the previous stop, including a full extra turn onto the same index', () => {
    const animator = new ReelAnimator([100, 100, 100]);
    animator.spin([0, 0, 0], options);
    const first = settle(animator);
    expect(first).toBeGreaterThan(40);
    animator.spin([50, 0, 99], { fast: true, reducedMotion: false });
    settle(animator);
    expect(animator.middleIndex(0)).toBe(50);
    expect(animator.middleIndex(1)).toBe(0);
    expect(animator.middleIndex(2)).toBe(99);
    expect(animator.maxLandingError).toBeLessThan(0.02);
  });

  it('still lands exactly when motion is reduced', () => {
    const strips = createDefaultReelSet();
    const animator = new ReelAnimator([strips[0].length, strips[1].length, strips[2].length]);
    animator.spin([1, 2, 3], { fast: false, reducedMotion: true });
    const frames = settle(animator);
    expect(frames).toBeLessThan(150);
    expect(animator.middleIndex(0)).toBe(1);
    expect(animator.middleIndex(1)).toBe(2);
    expect(animator.middleIndex(2)).toBe(3);
    expect(animator.maxLandingError).toBeLessThan(0.02);
  });
});
