import { stripAt } from '../engine/reels';
import {
  REEL_INDEXES,
  type LineWin,
  type Payline,
  type PaylineId,
  type ReelSet,
  type SymbolId,
} from '../types';
import { rowCenterY, symbolCenterY, traceRoundRect } from './geometry';
import type { ReelView } from './reelMotion';
import { drawSymbol } from './symbols';

export interface StageFrame {
  readonly strips: ReelSet;
  readonly reels: readonly [ReelView, ReelView, ReelView];
  readonly activeLines: readonly Payline[];
  readonly wins: readonly LineWin[];
  /** Bright pulse and dimmed losing symbols while the win count is running. */
  readonly celebrate: boolean;
  readonly banner: string;
  readonly time: number;
}

interface ReelBox {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly cellH: number;
}

interface StageLayout {
  readonly width: number;
  readonly height: number;
  readonly marquee: number;
  readonly reels: readonly [ReelBox, ReelBox, ReelBox];
}

const LINE_COLOR: Readonly<Record<PaylineId, string>> = {
  middle: '#f0d59a',
  top: '#7ee0c6',
  bottom: '#f3a0c2',
  diagDown: '#c4b5fd',
  diagUp: '#f0b36a',
};

/** Paint one frame of the reel cabinet. */
export function drawStage(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  frame: StageFrame,
): void {
  const layout = layoutStage(width, height);
  paintCabinet(ctx, width, height);
  paintBanner(ctx, layout, frame);
  for (const index of REEL_INDEXES) {
    paintReel(ctx, index, layout.reels[index], frame.strips[index], frame.reels[index], frame);
  }
  paintPaylines(ctx, layout, frame);
  paintWinFrames(ctx, layout, frame);
}

function layoutStage(width: number, height: number): StageLayout {
  const marquee = Math.max(36, height * 0.12);
  const padX = width * 0.035;
  const padBottom = height * 0.04;
  const gap = width * 0.018;
  const reelTop = marquee + height * 0.02;
  const reelH = Math.max(48, height - reelTop - padBottom);
  const reelW = (width - padX * 2 - gap * 2) / 3;
  const box = (index: 0 | 1 | 2): ReelBox => ({
    x: padX + index * (reelW + gap),
    y: reelTop,
    w: reelW,
    h: reelH,
    cellH: reelH / 3,
  });
  return {
    width,
    height,
    marquee,
    reels: [box(0), box(1), box(2)],
  };
}

function paintCabinet(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const background = ctx.createLinearGradient(0, 0, 0, height);
  background.addColorStop(0, '#1a2033');
  background.addColorStop(0.45, '#121624');
  background.addColorStop(1, '#0c1018');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  const glow = ctx.createRadialGradient(width / 2, 0, 10, width / 2, 0, width * 0.7);
  glow.addColorStop(0, 'rgba(240, 213, 154, 0.18)');
  glow.addColorStop(1, 'rgba(240, 213, 154, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height * 0.45);
}

function paintBanner(ctx: CanvasRenderingContext2D, layout: StageLayout, frame: StageFrame): void {
  ctx.save();
  const winning = frame.banner.startsWith('WIN');
  ctx.fillStyle = winning ? '#ffe7b0' : '#f3ddb0';
  ctx.font = `650 ${Math.max(20, layout.marquee * 0.38)}px Fraunces, Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const scale = frame.celebrate ? 1 + Math.sin(frame.time * 6) * 0.035 : 1;
  ctx.translate(layout.width / 2, layout.marquee * 0.52);
  ctx.scale(scale, scale);
  if (winning) {
    ctx.shadowColor = 'rgba(240, 190, 90, 0.85)';
    ctx.shadowBlur = 16;
  }
  ctx.fillText(frame.banner, 0, 0);
  ctx.restore();
}

function paintReel(
  ctx: CanvasRenderingContext2D,
  reelIndex: 0 | 1 | 2,
  box: ReelBox,
  strip: readonly SymbolId[],
  view: ReelView,
  frame: StageFrame,
): void {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 8;
  traceRoundRect(ctx, box.x, box.y, box.w, box.h, 18);
  const felt = ctx.createLinearGradient(box.x, box.y, box.x, box.y + box.h);
  felt.addColorStop(0, '#10151c');
  felt.addColorStop(0.5, '#1a221c');
  felt.addColorStop(1, '#0e131a');
  ctx.fillStyle = felt;
  ctx.fill();
  ctx.restore();

  ctx.save();
  traceRoundRect(ctx, box.x, box.y, box.w, box.h, 18);
  ctx.clip();
  const middleY = rowCenterY(box.y, box.cellH, 1);
  const drawPos = view.position + view.bounce;
  const winning = winningCells(frame.wins);
  for (let index = Math.floor(drawPos) - 3; index <= Math.floor(drawPos) + 3; index += 1) {
    const center = symbolCenterY(middleY, box.cellH, drawPos, index);
    const row = Math.round((center - box.y) / box.cellH - 0.5);
    const key = row === 0 || row === 1 || row === 2 ? `${reelIndex}:${row}` : '';
    const lit = key !== '' && winning.has(key);
    const dim = frame.celebrate && winning.size > 0 && key !== '' && !lit;
    ctx.save();
    ctx.globalAlpha = dim ? 0.38 : 1;
    drawSymbol(ctx, stripAt(strip, index), box.x, center - box.cellH / 2, box.w, box.cellH, {
      motion: view.motion,
      highlight: lit ? (frame.celebrate ? 0.55 + 0.45 * Math.sin(frame.time * 7) : 0.4) : 0,
      time: frame.time,
    });
    ctx.restore();
  }

  ctx.strokeStyle = 'rgba(240, 213, 154, 0.14)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (const row of [1, 2]) {
    const y = box.y + row * box.cellH;
    ctx.moveTo(box.x + 10, y);
    ctx.lineTo(box.x + box.w - 10, y);
  }
  ctx.stroke();

  const shade = ctx.createLinearGradient(box.x, box.y, box.x, box.y + box.h);
  shade.addColorStop(0, 'rgba(0,0,0,0.55)');
  shade.addColorStop(0.16, 'rgba(0,0,0,0)');
  shade.addColorStop(0.84, 'rgba(0,0,0,0)');
  shade.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = shade;
  ctx.fillRect(box.x, box.y, box.w, box.h);
  ctx.restore();

  ctx.save();
  traceRoundRect(ctx, box.x, box.y, box.w, box.h, 18);
  ctx.strokeStyle = 'rgba(240, 213, 154, 0.7)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function paintPaylines(
  ctx: CanvasRenderingContext2D,
  layout: StageLayout,
  frame: StageFrame,
): void {
  for (const line of frame.activeLines) {
    const win = frame.wins.some((item) => item.lineId === line.id);
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = win ? 4.5 : 2;
    ctx.strokeStyle = LINE_COLOR[line.id];
    ctx.globalAlpha = win ? 0.95 : 0.32;
    if (win && frame.celebrate) {
      ctx.setLineDash([14, 12]);
      ctx.lineDashOffset = -frame.time * 56;
      ctx.shadowColor = LINE_COLOR[line.id];
      ctx.shadowBlur = 14;
    }
    ctx.beginPath();
    for (const index of REEL_INDEXES) {
      const box = layout.reels[index];
      const x = box.x + box.w / 2;
      const y = rowCenterY(box.y, box.cellH, line.rows[index]);
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  }
}

function paintWinFrames(
  ctx: CanvasRenderingContext2D,
  layout: StageLayout,
  frame: StageFrame,
): void {
  if (frame.wins.length === 0) return;
  const pulse = frame.celebrate ? 0.55 + 0.45 * Math.sin(frame.time * 7) : 0.7;
  const seen = new Set<string>();
  for (const win of frame.wins) {
    for (const index of REEL_INDEXES) {
      const key = `${index}:${win.rows[index]}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const box = layout.reels[index];
      const row = win.rows[index];
      const pad = box.w * 0.08;
      ctx.save();
      ctx.globalAlpha = 0.35 + pulse * 0.65;
      ctx.strokeStyle = '#ffe3a3';
      ctx.lineWidth = 3;
      traceRoundRect(
        ctx,
        box.x + pad,
        box.y + row * box.cellH + box.cellH * 0.07,
        box.w - pad * 2,
        box.cellH * 0.86,
        14,
      );
      ctx.stroke();
      ctx.restore();
    }
  }
}

function winningCells(wins: readonly LineWin[]): Set<string> {
  const cells = new Set<string>();
  for (const win of wins) {
    for (const index of REEL_INDEXES) cells.add(`${index}:${win.rows[index]}`);
  }
  return cells;
}
