import { describe, expect, it } from 'vitest';
import {
  AUTO_SPIN_COUNT,
  changeBet,
  consumeAutoSpin,
  createMachine,
  currentBet,
  finishRound,
  INSUFFICIENT_CREDITS,
  markEvaluating,
  markStopping,
  markWinAnimation,
  resetBalance,
  setLineCount,
  setMaxBet,
  spinCost,
  startAuto,
  startSpin,
  stopAuto,
  type MachineState,
} from './state';
import type { RoundResult } from './spin';
import { linesForCount, type SymbolId } from '../types';

function roundWith(totalWin: number): RoundResult {
  const symbol: SymbolId = 'lemon';
  return {
    stops: [0, 0, 0],
    grid: [
      [symbol, symbol, symbol],
      [symbol, symbol, symbol],
      [symbol, symbol, symbol],
    ],
    evaluation: { wins: [], totalWin },
  };
}

function spin(state: MachineState, totalWin = 0) {
  return startSpin(state, roundWith(totalWin), 'manual');
}

describe('machine state', () => {
  it('charges the stake, banks the win, and refuses a second spin', () => {
    const started = spin(createMachine(1000), 40);
    expect(started.ok).toBe(true);
    if (!started.ok) return;
    expect(started.state.phase).toBe('spinning');
    expect(started.state.balance).toBe(1030);
    expect(started.state.pendingWin).toBe(40);
    expect(started.state.lastWin).toBe(40);

    const again = spin(started.state, 0);
    expect(again.ok).toBe(false);
    if (again.ok) return;
    expect(again.reason).toBe('busy');
    expect(again.state.balance).toBe(1030);
  });

  it('does not go negative when the stake does not fit', () => {
    const state = setLineCount(setMaxBet(createMachine(30)), 5);
    expect(spinCost(state)).toBe(500);
    const started = spin(state, 0);
    expect(started.ok).toBe(false);
    if (started.ok) return;
    expect(started.reason).toBe('insufficient');
    expect(started.state.balance).toBe(30);
    expect(started.state.phase).toBe('idle');
    expect(started.state.message).toBe(INSUFFICIENT_CREDITS);
  });

  it('allows a spin that spends the last credit', () => {
    const started = spin(createMachine(10), 0);
    expect(started.ok).toBe(true);
    if (!started.ok) return;
    expect(started.state.balance).toBe(0);
  });

  it('walks the phases and restores idle with the banked balance', () => {
    const started = spin(createMachine(100), 15);
    if (!started.ok) throw new Error('spin should start');
    const stopping = markStopping(started.state);
    const evaluating = markEvaluating(stopping);
    const animating = markWinAnimation(evaluating);
    const done = finishRound(animating);
    expect(done.phase).toBe('idle');
    expect(done.balance).toBe(105);
    expect(done.pendingWin).toBe(0);
    expect(done.lastWin).toBe(15);
  });

  it('skips the win animation when nothing was won and warns if broke', () => {
    const started = spin(createMachine(10), 0);
    if (!started.ok) throw new Error('spin should start');
    const done = finishRound(markEvaluating(markStopping(started.state)));
    expect(done.phase).toBe('idle');
    expect(done.balance).toBe(0);
    expect(done.message).toBe(INSUFFICIENT_CREDITS);
  });

  it('rejects an illegal phase change', () => {
    expect(() => markStopping(createMachine(100))).toThrow(/idle/);
  });

  it('clamps the bet, and max bet selects 100', () => {
    const machine = createMachine(1000);
    expect(currentBet(changeBet(machine, -1))).toBe(10);
    expect(currentBet(changeBet(machine, 1))).toBe(20);
    expect(currentBet(setMaxBet(machine))).toBe(100);
    expect(spinCost(setLineCount(setMaxBet(machine), 5))).toBe(500);
  });

  it('refuses bet changes and reset while a spin is running', () => {
    const started = spin(createMachine(1000), 0);
    if (!started.ok) throw new Error('spin should start');
    expect(changeBet(started.state, 1)).toBe(started.state);
    expect(resetBalance(started.state).balance).toBe(started.state.balance);
  });

  it('resets the balance only from idle', () => {
    const reset = resetBalance(createMachine(40));
    expect(reset.balance).toBe(1000);
    expect(reset.lastWin).toBe(0);
    expect(reset.round).toBeNull();
  });

  it('plays a fixed auto batch and can be cancelled', () => {
    const auto = startAuto(createMachine(1000));
    expect(auto.autoRemaining).toBe(AUTO_SPIN_COUNT);
    const started = startSpin(auto, roundWith(0), 'auto');
    if (!started.ok) throw new Error('spin should start');
    expect(started.state.autoRemaining).toBe(AUTO_SPIN_COUNT);
    const idle = finishRound(markEvaluating(markStopping(started.state)));
    const next = consumeAutoSpin(idle);
    expect(next.autoRemaining).toBe(AUTO_SPIN_COUNT - 1);
    expect(stopAuto(next).autoRemaining).toBe(0);
  });

  it('drops auto when a queued spin can no longer be paid', () => {
    const broke = { ...createMachine(0), autoRemaining: 4 };
    const started = startSpin(broke, roundWith(0), 'auto');
    expect(started.ok).toBe(false);
    if (started.ok) return;
    expect(started.state.autoRemaining).toBe(0);
    expect(started.state.message).toBe(INSUFFICIENT_CREDITS);
  });

  it('uses the middle line by default', () => {
    expect(linesForCount(1).map((line) => line.id)).toEqual(['middle']);
    expect(linesForCount(5)).toHaveLength(5);
  });
});
