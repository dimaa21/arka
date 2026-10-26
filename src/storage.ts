const BALANCE_KEY = 'lumina-reels.balance';
const MUTE_KEY = 'lumina-reels.muted';

/** Last saved virtual balance, or `fallback` when storage is empty or unusable. */
export function loadBalance(fallback: number): number {
  try {
    const raw = localStorage.getItem(BALANCE_KEY);
    if (raw === null) return fallback;
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0) return fallback;
    return Math.floor(value);
  } catch {
    return fallback;
  }
}

/** Persist the virtual balance. Failures (private mode) are ignored. */
export function saveBalance(value: number): void {
  try {
    localStorage.setItem(BALANCE_KEY, String(Math.floor(value)));
  } catch {
    // Storage can be blocked. The session still plays.
  }
}

/** Whether the player muted the generated sounds. */
export function loadMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
}

export function saveMuted(muted: boolean): void {
  try {
    localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
  } catch {
    // Ignore storage failures.
  }
}
