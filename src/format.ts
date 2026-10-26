/** Grouped virtual credits, rounded to the nearest credit. */
export function formatCredits(value: number): string {
  return Math.round(value).toLocaleString('en-US');
}

/** Format a 0–1 fraction as a percentage with a fixed number of decimals. */
export function formatPercent(fraction: number, digits = 2): string {
  return `${(fraction * 100).toFixed(digits)}%`;
}
