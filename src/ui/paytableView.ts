import { formatCredits, formatPercent } from '../format';
import { CHERRY_PAIR_MULTIPLIER, SYMBOL_LABEL, THREE_OF_A_KIND } from '../engine/paytable';
import { theoreticalLineHitRate, theoreticalLineRtp } from '../engine/rtp';
import { BET_OPTIONS, STARTING_BALANCE } from '../engine/state';
import { PAYLINES, SYMBOLS } from '../types';

/** Fill the paytable dialog from the same constants the engine uses. */
export function renderPaytable(root: HTMLElement): void {
  root.replaceChildren();

  const intro = paragraph(
    'Three matching symbols on a lit line pay the multiplier times the line bet. Wild stands in for any other symbol. Two cherries, or a cherry and a wild with a third unmatched symbol, pay a small prize.',
  );
  root.append(intro);

  const table = document.createElement('div');
  table.className = 'pay-table';
  for (const symbol of SYMBOLS) {
    table.append(payRow(`${SYMBOL_LABEL[symbol]} ×3`, `${THREE_OF_A_KIND[symbol]}×`));
    if (symbol === 'cherry') {
      table.append(payRow('Cherry ×2', `${CHERRY_PAIR_MULTIPLIER}×`));
    }
  }
  root.append(table);

  root.append(
    paragraph(
      '1 line plays the middle row. 5 lines adds the top row, the bottom row, and both diagonals. Each line is paid on its own, and the spin costs bet × lines.',
    ),
  );

  const lines = document.createElement('ul');
  lines.className = 'pay-lines';
  for (const line of PAYLINES) {
    const item = document.createElement('li');
    item.textContent = `${line.label} — ${line.rows.map(rowName).join(', ')}`;
    lines.append(item);
  }
  root.append(lines);

  root.append(
    paragraph(
      `Bets ${BET_OPTIONS.join(' / ')} credits per line. A new game starts at ${formatCredits(STARTING_BALANCE)}.`,
    ),
  );
  root.append(
    paragraph(
      `Theoretical RTP ${formatPercent(theoreticalLineRtp())} on every payline. About ${formatPercent(theoreticalLineHitRate())} of lines pay something. Five lines scale the stake and the average return together, so the RTP stays the same.`,
    ),
  );
  root.append(paragraph('Demo game, virtual credits only. Nothing here can be cashed out.'));
}

function payRow(label: string, value: string): HTMLElement {
  const row = document.createElement('div');
  row.className = 'pay-row';
  const name = document.createElement('span');
  name.textContent = label;
  const amount = document.createElement('strong');
  amount.textContent = value;
  row.append(name, amount);
  return row;
}

function paragraph(text: string): HTMLParagraphElement {
  const node = document.createElement('p');
  node.textContent = text;
  return node;
}

function rowName(row: number): string {
  if (row === 0) return 'top';
  if (row === 1) return 'middle';
  return 'bottom';
}
