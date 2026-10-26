import type { RoundResult } from './spin';
import { linesForCount, type Payline, type Phase } from '../types';

export const STARTING_BALANCE = 1000;
export const BET_OPTIONS = [10, 20, 50, 100] as const;
export const AUTO_SPIN_COUNT = 10;
export const INSUFFICIENT_CREDITS = 'Not enough credits';

export type BetOption = (typeof BET_OPTIONS)[number];
export type LineCount = 1 | 5;
export type SpinSource = 'manual' | 'auto';

export interface MachineState {
  readonly phase: Phase;
  readonly balance: number;
  readonly betIndex: number;
  readonly lineCount: LineCount;
  /** Win from the round currently on the reels. Already included in `balance`. */
  readonly lastWin: number;
  /** Portion of `balance` the UI should still count up. */
  readonly pendingWin: number;
  readonly message: string | null;
  /** Auto spins still to play, including one that is already in progress. */
  readonly autoRemaining: number;
  readonly round: RoundResult | null;
}

export type StartSpinResult =
  | { ok: true; state: MachineState }
  | { ok: false; reason: 'busy' | 'insufficient'; state: MachineState };

/** Fresh machine. `balance` is in virtual credits and must be zero or more. */
export function createMachine(balance: number): MachineState {
  if (!Number.isFinite(balance) || balance < 0) {
    throw new Error('balance must be zero or more');
  }
  return {
    phase: 'idle',
    balance: Math.floor(balance),
    betIndex: 0,
    lineCount: 1,
    lastWin: 0,
    pendingWin: 0,
    message: null,
    autoRemaining: 0,
    round: null,
  };
}

/** Stake for a single payline. */
export function currentBet(state: MachineState): number {
  return BET_OPTIONS[state.betIndex] ?? BET_OPTIONS[0];
}

/** Credits charged for the next spin. */
export function spinCost(state: MachineState): number {
  return currentBet(state) * state.lineCount;
}

/** Paylines that the next spin will score. */
export function activeLines(state: MachineState): readonly Payline[] {
  return linesForCount(state.lineCount);
}

export function changeBet(state: MachineState, direction: -1 | 1): MachineState {
  if (!canAdjust(state)) return state;
  const betIndex = clamp(state.betIndex + direction, 0, BET_OPTIONS.length - 1);
  return refreshFundsMessage({ ...state, betIndex, message: null });
}

export function setMaxBet(state: MachineState): MachineState {
  if (!canAdjust(state)) return state;
  return refreshFundsMessage({ ...state, betIndex: BET_OPTIONS.length - 1, message: null });
}

export function setLineCount(state: MachineState, lineCount: LineCount): MachineState {
  if (!canAdjust(state) || state.lineCount === lineCount) return state;
  return refreshFundsMessage({ ...state, lineCount, message: null });
}

/**
 * Commit a spin that was already resolved.
 * The stake is removed and the win is added immediately, so a refresh mid-spin
 * cannot lose a prize. `pendingWin` is what the counter still has to show.
 */
export function startSpin(
  state: MachineState,
  round: RoundResult,
  source: SpinSource,
): StartSpinResult {
  if (state.phase !== 'idle') {
    return { ok: false, reason: 'busy', state };
  }
  const cost = spinCost(state);
  if (state.balance < cost) {
    return {
      ok: false,
      reason: 'insufficient',
      state: {
        ...state,
        message: INSUFFICIENT_CREDITS,
        autoRemaining: 0,
      },
    };
  }
  const totalWin = round.evaluation.totalWin;
  return {
    ok: true,
    state: {
      ...state,
      phase: 'spinning',
      balance: state.balance - cost + totalWin,
      lastWin: totalWin,
      pendingWin: totalWin,
      message: null,
      autoRemaining: source === 'auto' ? state.autoRemaining : 0,
      round,
    },
  };
}

/** Player asked for a batch of spins. The caller starts the first one. */
export function startAuto(state: MachineState, count = AUTO_SPIN_COUNT): MachineState {
  if (!canAdjust(state)) return state;
  return { ...state, autoRemaining: count };
}

/** Cancel queued spins. The spin already on screen still finishes. */
export function stopAuto(state: MachineState): MachineState {
  if (state.autoRemaining === 0) return state;
  return { ...state, autoRemaining: 0 };
}

/**
 * Count one finished auto spin. Call this only after the machine is idle again.
 * The returned remaining count includes the spins still queued.
 */
export function consumeAutoSpin(state: MachineState): MachineState {
  if (state.phase !== 'idle' || state.autoRemaining <= 0) return state;
  return { ...state, autoRemaining: state.autoRemaining - 1 };
}

export function resetBalance(state: MachineState, amount = STARTING_BALANCE): MachineState {
  if (!canAdjust(state)) return state;
  return refreshFundsMessage({
    ...state,
    balance: amount,
    lastWin: 0,
    pendingWin: 0,
    message: null,
    round: null,
  });
}

export function markStopping(state: MachineState): MachineState {
  return transition(state, 'spinning', 'stopping');
}

export function markEvaluating(state: MachineState): MachineState {
  return transition(state, 'stopping', 'evaluating');
}

export function markWinAnimation(state: MachineState): MachineState {
  return transition(state, 'evaluating', 'winAnimation');
}

/** Return to idle and surface "Not enough credits" when the next stake won't fit. */
export function finishRound(state: MachineState): MachineState {
  if (state.phase !== 'evaluating' && state.phase !== 'winAnimation') {
    throw new Error(`cannot finish a round from ${state.phase}`);
  }
  return refreshFundsMessage({
    ...state,
    phase: 'idle',
    pendingWin: 0,
  });
}

/** Replace the funds warning when the stake or balance makes it stale. */
export function refreshFundsMessage(state: MachineState): MachineState {
  if (state.phase !== 'idle') return state;
  const short = state.balance < spinCost(state);
  if (short) return { ...state, message: INSUFFICIENT_CREDITS };
  if (state.message === INSUFFICIENT_CREDITS) return { ...state, message: null };
  return state;
}

function canAdjust(state: MachineState): boolean {
  return state.phase === 'idle' && state.autoRemaining === 0;
}

function transition(state: MachineState, from: Phase, to: Phase): MachineState {
  if (state.phase !== from) {
    throw new Error(`cannot move from ${state.phase} to ${to}`);
  }
  return { ...state, phase: to };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
