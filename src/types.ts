/** Identifiers for every symbol on the reels, from most common to rarest. */
export const SYMBOLS = ['cherry', 'lemon', 'bell', 'star', 'seven', 'diamond', 'wild'] as const;

export type SymbolId = (typeof SYMBOLS)[number];

/** Lifecycle of one spin. Animation code is the only thing that advances it. */
export type Phase = 'idle' | 'spinning' | 'stopping' | 'evaluating' | 'winAnimation';

export type ReelIndex = 0 | 1 | 2;
export type RowIndex = 0 | 1 | 2;

/** Top, middle, bottom symbols of one reel. */
export type ReelWindow = readonly [SymbolId, SymbolId, SymbolId];

/** Three reel windows. `grid[reel][row]`. */
export type SymbolGrid = readonly [ReelWindow, ReelWindow, ReelWindow];

export type ReelSet = readonly [readonly SymbolId[], readonly SymbolId[], readonly SymbolId[]];

export type PaylineId = 'middle' | 'top' | 'bottom' | 'diagDown' | 'diagUp';

export interface Payline {
  readonly id: PaylineId;
  readonly label: string;
  readonly rows: readonly [RowIndex, RowIndex, RowIndex];
}

/**
 * Paylines. The middle row is the base game; the other four are the optional set.
 * Rows are top = 0, middle = 1, bottom = 2.
 */
export const PAYLINES = [
  { id: 'middle', label: 'Middle', rows: [1, 1, 1] },
  { id: 'top', label: 'Top', rows: [0, 0, 0] },
  { id: 'bottom', label: 'Bottom', rows: [2, 2, 2] },
  { id: 'diagDown', label: 'Diagonal down', rows: [0, 1, 2] },
  { id: 'diagUp', label: 'Diagonal up', rows: [2, 1, 0] },
] as const satisfies readonly Payline[];

export const REEL_INDEXES = [0, 1, 2] as const satisfies readonly ReelIndex[];

/**
 * Active paylines for the selected mode.
 * `1` is the middle row only. `5` adds the top, bottom, and both diagonals.
 */
export function linesForCount(count: 1 | 5): readonly Payline[] {
  if (count === 5) return PAYLINES;
  const middle = PAYLINES.find((line) => line.id === 'middle');
  if (!middle) throw new Error('middle payline is missing');
  return [middle];
}

/** A three-of-a-kind or cherry-pair match before it is priced in credits. */
export interface LineMatch {
  readonly symbol: SymbolId;
  readonly count: 2 | 3;
  readonly multiplier: number;
}

/** A priced win on one payline. `rows` are the cells that should light up. */
export interface LineWin {
  readonly lineId: PaylineId;
  readonly symbol: SymbolId;
  readonly count: 2 | 3;
  readonly multiplier: number;
  readonly amount: number;
  readonly rows: readonly [RowIndex, RowIndex, RowIndex];
}

export interface Evaluation {
  readonly wins: readonly LineWin[];
  readonly totalWin: number;
}
