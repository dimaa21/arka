import { CHERRY_PAIR_MULTIPLIER, THREE_OF_A_KIND } from './paytable';
import type { Evaluation, LineMatch, LineWin, Payline, SymbolGrid, SymbolId } from '../types';

/**
 * Score one payline of three symbols.
 *
 * Wild substitutes for whatever other symbol is on the line. Three wilds pay
 * the Wild prize. A line that is not a triple pays the cherry pair when exactly
 * two of its cells are cherry or wild — so cherry + wild + lemon is a pair,
 * while cherry + wild + wild is three cherries.
 */
export function evaluateLine(symbols: readonly [SymbolId, SymbolId, SymbolId]): LineMatch | null {
  const plain: SymbolId[] = [];
  for (const symbol of symbols) {
    if (symbol !== 'wild') plain.push(symbol);
  }

  if (plain.length === 0) {
    return { symbol: 'wild', count: 3, multiplier: THREE_OF_A_KIND.wild };
  }

  const first = plain[0];
  if (first !== undefined && plain.every((symbol) => symbol === first)) {
    return { symbol: first, count: 3, multiplier: THREE_OF_A_KIND[first] };
  }

  let cherryLike = 0;
  for (const symbol of symbols) {
    if (symbol === 'cherry' || symbol === 'wild') cherryLike += 1;
  }
  if (cherryLike === 2) {
    return { symbol: 'cherry', count: 2, multiplier: CHERRY_PAIR_MULTIPLIER };
  }

  return null;
}

/**
 * Price every active payline. Wins on different lines stack.
 * `lineBet` is the stake for one line, not the whole spin.
 */
export function evaluateSpin(
  grid: SymbolGrid,
  lines: readonly Payline[],
  lineBet: number,
): Evaluation {
  if (!Number.isInteger(lineBet) || lineBet <= 0) {
    throw new Error('lineBet must be a positive integer');
  }

  const wins: LineWin[] = [];
  for (const line of lines) {
    const symbols: [SymbolId, SymbolId, SymbolId] = [
      symbolAt(grid, 0, line.rows[0]),
      symbolAt(grid, 1, line.rows[1]),
      symbolAt(grid, 2, line.rows[2]),
    ];
    const match = evaluateLine(symbols);
    if (!match) continue;
    wins.push({
      lineId: line.id,
      symbol: match.symbol,
      count: match.count,
      multiplier: match.multiplier,
      amount: match.multiplier * lineBet,
      rows: line.rows,
    });
  }

  let totalWin = 0;
  for (const win of wins) totalWin += win.amount;
  return { wins, totalWin };
}

function symbolAt(grid: SymbolGrid, reel: 0 | 1 | 2, row: 0 | 1 | 2): SymbolId {
  return grid[reel][row];
}
