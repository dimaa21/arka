import { createRng } from './engine/rng';
import { createDefaultReelSet } from './engine/reels';
import { theoreticalLineHitRate, theoreticalLineRtp } from './engine/rtp';
import { resolveRound } from './engine/spin';
import { linesForCount } from './types';
import { formatPercent } from './format';

const SPINS = 1_000_000;
const SEED = 1;
const LINE_BET = 1;

/**
 * Monte Carlo check of the paytable. The analytical figure is exact for one
 * line; the simulation should land on the same RTP within sampling noise.
 */
function main(): void {
  const analytical = theoreticalLineRtp();
  const hitRate = theoreticalLineHitRate();
  console.log('Lumina Reels — RTP simulation');
  console.log(`Analytical single-line RTP: ${formatPercent(analytical)}`);
  console.log(`Analytical single-line hit rate: ${formatPercent(hitRate)}`);
  console.log('');

  const started = performance.now();
  for (const lines of [1, 5] as const) {
    const result = simulate(lines);
    console.log(`${SPINS.toLocaleString('en-US')} spins, ${lines} line${lines === 1 ? '' : 's'}`);
    console.log(`  total bet: ${result.totalBet.toLocaleString('en-US')}`);
    console.log(`  total won: ${result.totalWon.toLocaleString('en-US')}`);
    console.log(`  RTP:       ${formatPercent(result.totalWon / result.totalBet)}`);
    console.log(`  hit rate:  ${formatPercent(result.hits / SPINS)}`);
    console.log('');
  }
  const seconds = (performance.now() - started) / 1000;
  console.log(`Elapsed ${seconds.toFixed(2)}s`);
}

function simulate(lineCount: 1 | 5): { totalBet: number; totalWon: number; hits: number } {
  const strips = createDefaultReelSet();
  const rng = createRng(SEED + lineCount);
  const lines = linesForCount(lineCount);
  let totalWon = 0;
  let hits = 0;
  for (let spin = 0; spin < SPINS; spin += 1) {
    const round = resolveRound(strips, rng, lines, LINE_BET);
    totalWon += round.evaluation.totalWin;
    if (round.evaluation.totalWin > 0) hits += 1;
  }
  return { totalBet: SPINS * lineCount * LINE_BET, totalWon, hits };
}

main();
