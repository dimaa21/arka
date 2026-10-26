import { mod } from '../engine/rng';
import type { ReelIndex } from '../types';

/** What the renderer needs for one reel on a single frame. */
export interface ReelView {
  readonly position: number;
  readonly bounce: number;
  readonly motion: number;
}

export interface ReelEvent {
  readonly type: 'landed';
  readonly reel: ReelIndex;
}

export interface SpinMotionOptions {
  /** Shorter travel used by auto-spin. */
  readonly fast: boolean;
  /** Near-instant stop for `prefers-reduced-motion`. */
  readonly reducedMotion: boolean;
}

interface ReelTiming {
  readonly maxVelocity: number;
  readonly accel: number;
  readonly stopAfter: readonly [number, number, number];
  readonly decelDistance: number;
  readonly decelDuration: number;
  readonly bounceDuration: number;
}

type ReelPhase = 'idle' | 'accel' | 'cruise' | 'align' | 'decel' | 'bounce';

interface Reel {
  position: number;
  velocity: number;
  motion: number;
  phase: ReelPhase;
  target: number;
  maxVelocity: number;
  stopAfter: number;
  alignLeft: number;
  decelDistance: number;
  decelFrom: number;
  decelTo: number;
  decelElapsed: number;
  decelDuration: number;
  bounceT: number;
  bounceDuration: number;
}

const INDEXES = [0, 1, 2] as const satisfies readonly ReelIndex[];
const NO_EVENTS: readonly ReelEvent[] = [];

/**
 * Scrolls each reel and eases it onto a stop chosen before the spin started.
 * The final parked index is always that stop; the bounce is visual only.
 */
export class ReelAnimator {
  private readonly reels: [Reel, Reel, Reel];
  private elapsed = 0;
  private running = false;
  private timing: ReelTiming = normalTiming(false);
  /** Largest distance, in symbols, between the ease target and the chosen stop. */
  maxLandingError = 0;

  constructor(private readonly lengths: readonly [number, number, number]) {
    this.reels = [parkedReel(0), parkedReel(0), parkedReel(0)];
  }

  /** Start a spin toward `stops`. Ignored if a spin is already running. */
  spin(stops: readonly [number, number, number], options: SpinMotionOptions): void {
    if (this.running) return;
    this.timing = options.reducedMotion ? reducedTiming() : normalTiming(options.fast);
    this.elapsed = 0;
    this.running = true;
    this.maxLandingError = 0;
    for (const index of INDEXES) {
      const reel = this.reels[index];
      reel.phase = 'accel';
      reel.velocity = 0;
      reel.motion = 0;
      reel.maxVelocity = this.timing.maxVelocity;
      reel.stopAfter = this.timing.stopAfter[index];
      reel.target = mod(Math.trunc(stops[index]), this.lengths[index]);
      reel.bounceT = 0;
      reel.alignLeft = 0;
      reel.decelDuration = this.timing.decelDuration;
      reel.bounceDuration = this.timing.bounceDuration;
    }
  }

  /** Advance the spin. `dt` is seconds and is capped so a stalled tab cannot skip the landing. */
  update(dt: number): readonly ReelEvent[] {
    if (!this.running) return NO_EVENTS;
    const step = Math.min(Math.max(dt, 0), 0.05);
    this.elapsed += step;
    const events: ReelEvent[] = [];
    for (const index of INDEXES) this.updateReel(index, step, events);
    if (this.reels.every((reel) => reel.phase === 'idle')) this.running = false;
    return events.length === 0 ? NO_EVENTS : events;
  }

  isSettled(): boolean {
    return !this.running;
  }

  /** True once the first reel has left cruise and started aiming at its stop. */
  isStopping(): boolean {
    if (!this.running) return false;
    return this.reels.some(
      (reel) =>
        reel.phase === 'align' ||
        reel.phase === 'decel' ||
        reel.phase === 'bounce' ||
        reel.phase === 'idle',
    );
  }

  views(): readonly [ReelView, ReelView, ReelView] {
    return [this.view(0), this.view(1), this.view(2)];
  }

  /** Strip index parked on the middle row. */
  middleIndex(reel: ReelIndex): number {
    return mod(Math.round(this.reels[reel].position), this.lengths[reel]);
  }

  private view(index: ReelIndex): ReelView {
    const reel = this.reels[index];
    return {
      position: reel.position,
      bounce: bounceOffset(reel),
      motion: reel.motion,
    };
  }

  private updateReel(index: ReelIndex, dt: number, events: ReelEvent[]): void {
    const reel = this.reels[index];
    if (reel.phase === 'accel' || reel.phase === 'cruise') {
      reel.velocity = Math.min(reel.maxVelocity, reel.velocity + this.timing.accel * dt);
      reel.position += reel.velocity * dt;
      reel.motion = reel.maxVelocity === 0 ? 0 : reel.velocity / reel.maxVelocity;
      if (reel.velocity >= reel.maxVelocity - 0.001) {
        reel.velocity = reel.maxVelocity;
        reel.phase = 'cruise';
      }
      if (this.elapsed >= reel.stopAfter) this.beginAlign(reel, index);
      return;
    }
    if (reel.phase === 'align') {
      const distance = Math.min(reel.alignLeft, reel.velocity * dt);
      reel.position += distance;
      reel.alignLeft -= distance;
      reel.motion = 1;
      if (reel.alignLeft <= 1e-6) this.beginDecel(reel);
      return;
    }
    if (reel.phase === 'decel') {
      this.stepDecel(reel, index, dt, events);
      return;
    }
    if (reel.phase === 'bounce') this.stepBounce(reel, dt);
  }

  private beginAlign(reel: Reel, index: ReelIndex): void {
    const length = this.lengths[index];
    const wrapped = mod(reel.position, length);
    let distance = mod(reel.target - wrapped, length);
    const decelDistance = Math.min(this.timing.decelDistance, length / 2);
    if (distance < decelDistance) distance += length;
    reel.alignLeft = distance - decelDistance;
    reel.decelDistance = decelDistance;
    reel.velocity = reel.maxVelocity;
    reel.motion = 1;
    reel.phase = 'align';
  }

  private beginDecel(reel: Reel): void {
    reel.phase = 'decel';
    reel.decelFrom = reel.position;
    reel.decelTo = reel.position + reel.decelDistance;
    reel.decelElapsed = 0;
    reel.decelDuration = this.timing.decelDuration;
    reel.bounceDuration = this.timing.bounceDuration;
  }

  private stepDecel(reel: Reel, index: ReelIndex, dt: number, events: ReelEvent[]): void {
    reel.decelElapsed += dt;
    const duration = Math.max(reel.decelDuration, 0.0001);
    const t = Math.min(1, reel.decelElapsed / duration);
    const eased = 1 - (1 - t) * (1 - t);
    reel.position = reel.decelFrom + (reel.decelTo - reel.decelFrom) * eased;
    reel.velocity = (reel.decelDistance / duration) * 2 * (1 - t);
    reel.motion = reel.maxVelocity === 0 ? 0 : Math.min(1, reel.velocity / reel.maxVelocity);
    if (t < 1) return;

    reel.position = reel.decelTo;
    const length = this.lengths[index];
    const nearest = reel.target + Math.round((reel.position - reel.target) / length) * length;
    this.maxLandingError = Math.max(this.maxLandingError, Math.abs(nearest - reel.position));
    reel.position = reel.target;
    reel.velocity = 0;
    reel.motion = 0;
    events.push({ type: 'landed', reel: index });
    if (reel.bounceDuration <= 0) {
      reel.phase = 'idle';
      reel.bounceT = 0;
      return;
    }
    reel.phase = 'bounce';
    reel.bounceT = 0;
  }

  private stepBounce(reel: Reel, dt: number): void {
    reel.bounceT += dt;
    if (reel.bounceT < reel.bounceDuration) return;
    reel.bounceT = reel.bounceDuration;
    reel.phase = 'idle';
  }
}

function parkedReel(position: number): Reel {
  return {
    position,
    velocity: 0,
    motion: 0,
    phase: 'idle',
    target: position,
    maxVelocity: 72,
    stopAfter: 0,
    alignLeft: 0,
    decelDistance: 0,
    decelFrom: 0,
    decelTo: 0,
    decelElapsed: 0,
    decelDuration: 0.5,
    bounceT: 0,
    bounceDuration: 0,
  };
}

function bounceOffset(reel: Reel): number {
  if (reel.phase !== 'bounce' || reel.bounceDuration <= 0) return 0;
  const progress = Math.min(1, reel.bounceT / reel.bounceDuration);
  return Math.sin(progress * Math.PI) * (1 - progress) * 0.22;
}

function normalTiming(fast: boolean): ReelTiming {
  if (fast) {
    return {
      maxVelocity: 88,
      accel: 260,
      stopAfter: [0.32, 0.56, 0.8],
      decelDistance: 8,
      decelDuration: 0.42,
      bounceDuration: 0.18,
    };
  }
  return {
    maxVelocity: 72,
    accel: 200,
    stopAfter: [0.62, 1.02, 1.42],
    decelDistance: 9,
    decelDuration: 0.58,
    bounceDuration: 0.3,
  };
}

function reducedTiming(): ReelTiming {
  return {
    maxVelocity: 220,
    accel: 800,
    stopAfter: [0.08, 0.14, 0.2],
    decelDistance: 4,
    decelDuration: 0.12,
    bounceDuration: 0,
  };
}
