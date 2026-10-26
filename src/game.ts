import { Sfx } from './audio/sfx';
import { createRng, type Rng } from './engine/rng';
import { createDefaultReelSet } from './engine/reels';
import { resolveRound } from './engine/spin';
import {
  activeLines,
  changeBet,
  consumeAutoSpin,
  createMachine,
  currentBet,
  finishRound,
  INSUFFICIENT_CREDITS,
  markEvaluating,
  markStopping,
  markWinAnimation,
  refreshFundsMessage,
  resetBalance,
  setLineCount,
  setMaxBet,
  spinCost,
  startAuto,
  startSpin,
  stopAuto,
  STARTING_BALANCE,
  type LineCount,
  type MachineState,
  type SpinSource,
} from './engine/state';
import { formatCredits } from './format';
import { drawStage } from './render/stage';
import { ReelAnimator } from './render/reelMotion';
import { loadBalance, loadMuted, saveBalance, saveMuted } from './storage';
import { renderPaytable } from './ui/paytableView';
import type { ReelSet } from './types';

interface Elements {
  canvas: HTMLCanvasElement;
  stage: HTMLElement;
  balance: HTMLElement;
  bet: HTMLElement;
  win: HTMLElement;
  stake: HTMLElement;
  message: HTMLElement;
  live: HTMLElement;
  spin: HTMLButtonElement;
  auto: HTMLButtonElement;
  betUp: HTMLButtonElement;
  betDown: HTMLButtonElement;
  maxBet: HTMLButtonElement;
  mute: HTMLButtonElement;
  lines1: HTMLButtonElement;
  lines5: HTMLButtonElement;
  reset: HTMLButtonElement;
  paytableButton: HTMLButtonElement;
  paytable: HTMLDialogElement;
  paytableBody: HTMLElement;
}

/**
 * Wires the pure engine to input, the reel animator, and the canvas.
 * A spin's stops are chosen before the reels move.
 */
export class SlotGame {
  private readonly elements: Elements;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly strips: ReelSet;
  private readonly animator: ReelAnimator;
  private readonly sfx: Sfx;
  private readonly rng: Rng;
  private state: MachineState;
  private shownBalance: number;
  private shownWin = 0;
  private balanceTarget: number;
  private winElapsed = 0;
  private autoDelay = 0;
  private time = 0;
  private lastTime = 0;
  private started = false;
  private spinActive = false;
  private cssWidth = 0;
  private cssHeight = 0;
  private dpr = 1;
  private readonly cache = {
    balance: '',
    bet: '',
    win: '',
    stake: '',
    message: '',
    auto: '',
    spin: '',
    mute: '',
  };

  constructor() {
    this.elements = readElements();
    const ctx = this.elements.canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Canvas 2D is not available');
    this.ctx = ctx;
    this.strips = createDefaultReelSet();
    this.animator = new ReelAnimator([
      this.strips[0].length,
      this.strips[1].length,
      this.strips[2].length,
    ]);
    this.sfx = new Sfx(loadMuted());
    this.rng = createSpinRng();
    this.state = refreshFundsMessage(createMachine(loadBalance(STARTING_BALANCE)));
    this.shownBalance = this.state.balance;
    this.balanceTarget = this.state.balance;
    renderPaytable(this.elements.paytableBody);
    this.bind();
  }

  /** Start the frame loop. Safe to call once. */
  start(): void {
    if (this.started) return;
    this.started = true;
    this.resize();
    this.sync();
    requestAnimationFrame(this.frame);
  }

  private readonly frame = (now: number): void => {
    if (this.lastTime === 0) this.lastTime = now;
    const dt = Math.min(0.05, Math.max(0, (now - this.lastTime) / 1000));
    this.lastTime = now;
    this.time += dt;
    this.update(dt);
    this.draw();
    this.sync();
    requestAnimationFrame(this.frame);
  };

  private update(dt: number): void {
    if (this.spinActive && (this.state.phase === 'spinning' || this.state.phase === 'stopping')) {
      const events = this.animator.update(dt);
      for (const event of events) this.sfx.playStop(event.reel);
    }

    if (this.state.phase === 'spinning' && this.animator.isStopping()) {
      this.state = markStopping(this.state);
    }

    if (this.spinActive && this.animator.isSettled() && this.state.phase === 'spinning') {
      this.state = markStopping(this.state);
    }

    if (this.spinActive && this.animator.isSettled() && this.state.phase === 'stopping') {
      this.spinActive = false;
      this.enterEvaluation();
    }

    if (this.state.phase === 'winAnimation') this.updateWin(dt);

    if (
      this.state.phase === 'spinning' ||
      this.state.phase === 'stopping' ||
      this.state.phase === 'evaluating'
    ) {
      this.shownBalance = approach(this.shownBalance, this.balanceTarget, dt, 12);
    }

    if (this.state.phase === 'idle' && this.autoDelay > 0) {
      this.autoDelay = Math.max(0, this.autoDelay - dt);
      if (this.autoDelay === 0) this.beginSpin('auto');
    }
  }

  private enterEvaluation(): void {
    this.state = markEvaluating(this.state);
    if (this.state.pendingWin > 0) {
      this.state = markWinAnimation(this.state);
      this.winElapsed = 0;
      this.shownBalance = this.state.balance - this.state.pendingWin;
      this.shownWin = 0;
      this.sfx.playWin(winSize(this.state.pendingWin, spinCost(this.state)));
      this.announce(`Win ${formatCredits(this.state.pendingWin)} credits`);
      return;
    }
    this.shownBalance = this.state.balance;
    this.shownWin = 0;
    this.state = finishRound(this.state);
    this.announce('No win');
    this.queueAuto();
  }

  private updateWin(dt: number): void {
    this.winElapsed += dt;
    const duration = this.prefersReducedMotion() ? 0.25 : 1.2;
    const t = Math.min(1, this.winElapsed / duration);
    const eased = 1 - (1 - t) ** 3;
    const start = this.state.balance - this.state.pendingWin;
    this.shownBalance = start + (this.state.balance - start) * eased;
    this.shownWin = this.state.pendingWin * eased;
    if (t < 1) return;
    this.shownBalance = this.state.balance;
    this.shownWin = this.state.pendingWin;
    this.state = finishRound(this.state);
    this.queueAuto();
  }

  private queueAuto(): void {
    if (this.state.phase !== 'idle' || this.state.autoRemaining <= 0) return;
    this.state = consumeAutoSpin(this.state);
    if (this.state.autoRemaining > 0) this.autoDelay = this.prefersReducedMotion() ? 0.05 : 0.34;
  }

  private beginSpin(source: SpinSource): void {
    if (this.state.phase !== 'idle') return;
    if (this.state.balance < spinCost(this.state)) {
      this.autoDelay = 0;
      this.state = { ...this.state, message: INSUFFICIENT_CREDITS, autoRemaining: 0 };
      return;
    }
    const round = resolveRound(
      this.strips,
      this.rng,
      activeLines(this.state),
      currentBet(this.state),
    );
    const result = startSpin(this.state, round, source);
    this.state = result.state;
    if (!result.ok) {
      this.autoDelay = 0;
      return;
    }
    const committed = result.state.round;
    if (!committed) throw new Error('spin did not record a round');
    saveBalance(this.state.balance);
    this.balanceTarget = this.state.balance - this.state.pendingWin;
    this.shownWin = 0;
    this.winElapsed = 0;
    this.spinActive = true;
    this.animator.spin(committed.stops, {
      fast: source === 'auto',
      reducedMotion: this.prefersReducedMotion(),
    });
    this.sfx.unlock();
    this.sfx.playSpin();
  }

  private draw(): void {
    this.resize();
    const celebrate = this.state.phase === 'winAnimation';
    const showWins = celebrate || this.state.phase === 'idle';
    const wins =
      showWins && this.state.lastWin > 0 ? (this.state.round?.evaluation.wins ?? []) : [];
    const banner =
      celebrate && this.state.pendingWin > 0
        ? `WIN ${formatCredits(this.shownWin)}`
        : 'LUMINA REELS';
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    drawStage(this.ctx, this.cssWidth, this.cssHeight, {
      strips: this.strips,
      reels: this.animator.views(),
      activeLines: activeLines(this.state),
      wins,
      celebrate,
      banner,
      time: this.time,
    });
  }

  private sync(): void {
    const { elements: ui, cache } = this;
    const balance = formatCredits(this.shownBalance);
    const bet = formatCredits(currentBet(this.state));
    const winValue =
      this.state.phase === 'winAnimation'
        ? this.shownWin
        : this.state.phase === 'idle'
          ? this.state.lastWin
          : 0;
    const win = formatCredits(winValue);
    const cost = spinCost(this.state);
    const stake =
      this.state.lineCount === 1
        ? `1 line · costs ${formatCredits(cost)}`
        : `${this.state.lineCount} lines · costs ${formatCredits(cost)}`;
    const message = this.state.message ?? '';
    const autoLabel = this.state.autoRemaining > 0 ? `Stop (${this.state.autoRemaining})` : 'Auto';
    const spinLabel =
      this.state.phase === 'spinning' || this.state.phase === 'stopping' ? 'Spinning' : 'Spin';
    const muteLabel = this.sfx.muted ? 'Sound off' : 'Sound on';

    writeText(ui.balance, cache, 'balance', balance);
    writeText(ui.bet, cache, 'bet', bet);
    writeText(ui.win, cache, 'win', win);
    writeText(ui.stake, cache, 'stake', stake);
    writeText(ui.message, cache, 'message', message);
    writeText(ui.auto, cache, 'auto', autoLabel);
    writeText(ui.spin, cache, 'spin', spinLabel);
    writeText(ui.mute, cache, 'mute', muteLabel);

    ui.stake.classList.toggle('is-short', this.state.phase === 'idle' && this.state.balance < cost);
    const locked = this.state.phase !== 'idle' || this.state.autoRemaining > 0;
    ui.spin.disabled = locked;
    ui.betUp.disabled = locked;
    ui.betDown.disabled = locked;
    ui.maxBet.disabled = locked;
    ui.lines1.disabled = locked;
    ui.lines5.disabled = locked;
    ui.reset.disabled = locked;
    ui.auto.disabled = this.state.phase !== 'idle' && this.state.autoRemaining === 0;
    ui.lines1.setAttribute('aria-pressed', String(this.state.lineCount === 1));
    ui.lines5.setAttribute('aria-pressed', String(this.state.lineCount === 5));
    ui.mute.setAttribute('aria-pressed', String(this.sfx.muted));
    ui.canvas.setAttribute(
      'aria-busy',
      String(this.state.phase === 'spinning' || this.state.phase === 'stopping'),
    );
  }

  private resize(): void {
    const rect = this.elements.stage.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    if (width === this.cssWidth && height === this.cssHeight && dpr === this.dpr) return;
    this.cssWidth = width;
    this.cssHeight = height;
    this.dpr = dpr;
    this.elements.canvas.width = Math.round(width * dpr);
    this.elements.canvas.height = Math.round(height * dpr);
  }

  private bind(): void {
    const ui = this.elements;
    ui.spin.addEventListener('click', () => {
      this.beginSpin('manual');
    });
    ui.betDown.addEventListener('click', () => {
      this.adjustBet(-1);
    });
    ui.betUp.addEventListener('click', () => {
      this.adjustBet(1);
    });
    ui.maxBet.addEventListener('click', () => {
      const next = setMaxBet(this.state);
      if (next.betIndex !== this.state.betIndex) this.sfx.playClick();
      this.state = next;
    });
    ui.auto.addEventListener('click', () => {
      this.toggleAuto();
    });
    ui.mute.addEventListener('click', () => {
      this.toggleMute();
    });
    ui.lines1.addEventListener('click', () => {
      this.chooseLines(1);
    });
    ui.lines5.addEventListener('click', () => {
      this.chooseLines(5);
    });
    ui.reset.addEventListener('click', () => {
      this.onReset();
    });
    ui.paytableButton.addEventListener('click', () => {
      ui.paytable.showModal();
    });
    ui.paytable.addEventListener('click', (event) => {
      if (event.target === ui.paytable) ui.paytable.close();
    });
    window.addEventListener('keydown', (event) => {
      this.onKey(event);
    });
  }

  private adjustBet(direction: -1 | 1): void {
    const next = changeBet(this.state, direction);
    if (next.betIndex !== this.state.betIndex) this.sfx.playClick();
    this.state = next;
  }

  private chooseLines(count: LineCount): void {
    const next = setLineCount(this.state, count);
    if (next === this.state) return;
    this.sfx.playClick();
    this.state = next;
  }

  private toggleAuto(): void {
    if (this.state.autoRemaining > 0) {
      this.state = stopAuto(this.state);
      this.autoDelay = 0;
      this.sfx.playClick();
      return;
    }
    if (this.state.phase !== 'idle') return;
    this.sfx.playClick();
    this.state = startAuto(this.state);
    this.beginSpin('auto');
  }

  private toggleMute(): void {
    this.sfx.setMuted(!this.sfx.muted);
    saveMuted(this.sfx.muted);
    if (!this.sfx.muted) {
      this.sfx.unlock();
      this.sfx.playClick();
    }
  }

  private onReset(): void {
    const next = resetBalance(this.state);
    if (next === this.state) return;
    this.state = next;
    this.shownBalance = this.state.balance;
    this.shownWin = 0;
    this.balanceTarget = this.state.balance;
    saveBalance(this.state.balance);
    this.sfx.playClick();
    this.announce('Balance reset to 1000 credits');
  }

  private onKey(event: KeyboardEvent): void {
    if (event.code !== 'Space' && event.key !== ' ') return;
    if (event.repeat) return;
    if (this.elements.paytable.open) return;
    const target = event.target;
    if (target instanceof HTMLElement && target.closest('button, a, input, textarea, select'))
      return;
    event.preventDefault();
    if (this.state.autoRemaining > 0) return;
    this.beginSpin('manual');
  }

  private announce(text: string): void {
    this.elements.live.textContent = text;
  }

  private prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}

function approach(current: number, target: number, dt: number, speed: number): number {
  const next = current + (target - current) * (1 - Math.exp(-dt * speed));
  if (Math.abs(target - next) < 0.4) return target;
  return next;
}

function winSize(win: number, cost: number): 'small' | 'medium' | 'big' {
  if (win >= cost * 10) return 'big';
  if (win >= cost * 3) return 'medium';
  return 'small';
}

function writeText(
  node: HTMLElement,
  cache: SlotGameCache,
  key: keyof SlotGameCache,
  value: string,
): void {
  if (cache[key] === value) return;
  cache[key] = value;
  node.textContent = value;
}

interface SlotGameCache {
  balance: string;
  bet: string;
  win: string;
  stake: string;
  message: string;
  auto: string;
  spin: string;
  mute: string;
}

function createSpinRng(): Rng {
  const raw = new URLSearchParams(window.location.search).get('seed');
  if (raw !== null && raw.trim() !== '' && Number.isFinite(Number(raw))) {
    return createRng(Number(raw));
  }
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return createRng((buffer[0] ?? 1) ^ Date.now());
}

function readElements(): Elements {
  return {
    canvas: required('reels', HTMLCanvasElement),
    stage: required('stage', HTMLElement),
    balance: required('balance', HTMLElement),
    bet: required('bet', HTMLElement),
    win: required('win', HTMLElement),
    stake: required('stake', HTMLElement),
    message: required('message', HTMLElement),
    live: required('live', HTMLElement),
    spin: required('spin', HTMLButtonElement),
    auto: required('auto', HTMLButtonElement),
    betUp: required('bet-up', HTMLButtonElement),
    betDown: required('bet-down', HTMLButtonElement),
    maxBet: required('max-bet', HTMLButtonElement),
    mute: required('mute', HTMLButtonElement),
    lines1: required('lines-1', HTMLButtonElement),
    lines5: required('lines-5', HTMLButtonElement),
    reset: required('reset', HTMLButtonElement),
    paytableButton: required('paytable-btn', HTMLButtonElement),
    paytable: required('paytable', HTMLDialogElement),
    paytableBody: required('paytable-body', HTMLElement),
  };
}

function required<T extends Element>(id: string, ctor: new () => T): T {
  const node = document.getElementById(id);
  if (!(node instanceof ctor)) throw new Error(`Missing #${id}`);
  return node;
}
