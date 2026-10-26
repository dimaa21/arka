import { describe, expect, it } from 'vitest';
import { theoreticalLineHitRate, theoreticalLineRtp } from './rtp';

describe('theoretical RTP', () => {
  it('matches the published single-line return', () => {
    expect(theoreticalLineRtp()).toBeCloseTo(0.964241, 6);
    expect(theoreticalLineHitRate()).toBeCloseTo(0.237925, 6);
  });
});
