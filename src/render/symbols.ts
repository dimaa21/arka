import type { SymbolId } from '../types';

export interface SymbolDrawOptions {
  /** 0 is sharp, 1 is a full-speed streak. */
  readonly motion: number;
  /** 0 hides the win glow. 1 is the brightest pulse. */
  readonly highlight: number;
  readonly time: number;
}

const FILL: Readonly<Record<SymbolId, string>> = {
  cherry: '#ff5d6c',
  lemon: '#ffe08a',
  bell: '#f3c27a',
  star: '#ffe7ae',
  seven: '#ff6a45',
  diamond: '#8af0ff',
  wild: '#7dffc3',
};

/**
 * Draw one symbol centered in the cell rectangle.
 * Shapes are original canvas geometry — no external art.
 */
export function drawSymbol(
  ctx: CanvasRenderingContext2D,
  symbol: SymbolId,
  x: number,
  y: number,
  width: number,
  height: number,
  options: SymbolDrawOptions,
): void {
  const radius = Math.min(width, height) * 0.34;
  ctx.save();
  ctx.translate(x + width / 2, y + height / 2);
  if (options.highlight > 0) {
    ctx.shadowColor = 'rgba(255, 220, 150, 0.95)';
    ctx.shadowBlur = 16 + 18 * options.highlight;
  }
  if (options.motion > 0.48) {
    drawStreak(ctx, symbol, width, height, options.motion);
    ctx.restore();
    return;
  }
  if (options.motion > 0.18) {
    ctx.save();
    ctx.globalAlpha = 0.28;
    ctx.translate(0, height * 0.12 * options.motion);
    drawCrisp(ctx, symbol, radius, options.time);
    ctx.restore();
  }
  drawCrisp(ctx, symbol, radius, options.time);
  ctx.restore();
}

function drawCrisp(
  ctx: CanvasRenderingContext2D,
  symbol: SymbolId,
  radius: number,
  time: number,
): void {
  drawDisc(ctx, radius, optionsHighlight(symbol));
  switch (symbol) {
    case 'cherry':
      drawCherry(ctx, radius);
      break;
    case 'lemon':
      drawLemon(ctx, radius);
      break;
    case 'bell':
      drawBell(ctx, radius);
      break;
    case 'star':
      drawStar(ctx, radius);
      break;
    case 'seven':
      drawSeven(ctx, radius);
      break;
    case 'diamond':
      drawDiamond(ctx, radius);
      break;
    case 'wild':
      drawWild(ctx, radius, time);
      break;
  }
}

function optionsHighlight(symbol: SymbolId): string {
  return FILL[symbol];
}

function drawDisc(ctx: CanvasRenderingContext2D, radius: number, tint: string): void {
  const gradient = ctx.createRadialGradient(
    -radius * 0.25,
    -radius * 0.35,
    radius * 0.1,
    0,
    0,
    radius * 1.35,
  );
  gradient.addColorStop(0, 'rgba(255,255,255,0.2)');
  gradient.addColorStop(0.45, withAlpha(tint, 0.18));
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 1.2, 0, Math.PI * 2);
  ctx.fill();
}

function drawStreak(
  ctx: CanvasRenderingContext2D,
  symbol: SymbolId,
  width: number,
  height: number,
  motion: number,
): void {
  const gradient = ctx.createLinearGradient(0, -height * 0.48, 0, height * 0.48);
  const color = FILL[symbol];
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(0.28, withAlpha(color, 0.15));
  gradient.addColorStop(0.5, withAlpha('#ffffff', 0.85));
  gradient.addColorStop(0.72, withAlpha(color, 0.2));
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = 0.45 + motion * 0.4;
  ctx.fillStyle = gradient;
  ctx.fillRect(-width * 0.16, -height * 0.48, width * 0.32, height * 0.96);
  ctx.globalAlpha = 1;
}

function drawCherry(ctx: CanvasRenderingContext2D, radius: number): void {
  ctx.beginPath();
  ctx.moveTo(-radius * 0.16, radius * 0.02);
  ctx.quadraticCurveTo(-radius * 0.02, -radius * 0.55, radius * 0.18, -radius * 0.82);
  ctx.moveTo(radius * 0.2, radius * 0.08);
  ctx.quadraticCurveTo(radius * 0.12, -radius * 0.42, radius * 0.18, -radius * 0.82);
  ctx.strokeStyle = '#2c8d49';
  ctx.lineWidth = Math.max(2, radius * 0.08);
  ctx.lineCap = 'round';
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(radius * 0.46, -radius * 0.7, radius * 0.28, radius * 0.13, -0.7, 0, Math.PI * 2);
  const leaf = ctx.createLinearGradient(radius * 0.1, -radius, radius * 0.7, -radius * 0.4);
  leaf.addColorStop(0, '#b6f5c8');
  leaf.addColorStop(1, '#1d8a45');
  ctx.fillStyle = leaf;
  ctx.fill();

  drawBerry(ctx, -radius * 0.32, radius * 0.22, radius * 0.4);
  drawBerry(ctx, radius * 0.3, radius * 0.26, radius * 0.4);
}

function drawBerry(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number): void {
  const gradient = ctx.createRadialGradient(
    x - radius * 0.35,
    y - radius * 0.4,
    radius * 0.1,
    x,
    y,
    radius,
  );
  gradient.addColorStop(0, '#ffd0d4');
  gradient.addColorStop(0.45, '#ef3048');
  gradient.addColorStop(1, '#8a1022');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.beginPath();
  ctx.ellipse(
    x - radius * 0.28,
    y - radius * 0.32,
    radius * 0.16,
    radius * 0.09,
    -0.7,
    0,
    Math.PI * 2,
  );
  ctx.fill();
}

function drawLemon(ctx: CanvasRenderingContext2D, radius: number): void {
  ctx.save();
  ctx.rotate(-0.55);
  ctx.scale(1.2, 0.76);
  const gradient = ctx.createRadialGradient(
    -radius * 0.25,
    -radius * 0.2,
    radius * 0.1,
    0,
    0,
    radius,
  );
  gradient.addColorStop(0, '#fff7cf');
  gradient.addColorStop(0.55, '#ffd34a');
  gradient.addColorStop(1, '#e09512');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.82, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = '#2f9a45';
  ctx.beginPath();
  ctx.ellipse(-radius * 0.78, radius * 0.28, radius * 0.1, radius * 0.16, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(radius * 0.78, -radius * 0.28, radius * 0.1, radius * 0.16, 1, 0, Math.PI * 2);
  ctx.fill();
}

function drawBell(ctx: CanvasRenderingContext2D, radius: number): void {
  const gradient = ctx.createLinearGradient(-radius, -radius, radius, radius);
  gradient.addColorStop(0, '#fff1c9');
  gradient.addColorStop(0.45, '#f0c16a');
  gradient.addColorStop(1, '#b47b2a');
  ctx.fillStyle = gradient;
  ctx.strokeStyle = '#8a5a18';
  ctx.lineWidth = Math.max(1.5, radius * 0.04);

  ctx.beginPath();
  ctx.moveTo(-radius * 0.16, -radius * 0.78);
  ctx.lineTo(radius * 0.16, -radius * 0.78);
  ctx.lineTo(radius * 0.22, -radius * 0.58);
  ctx.lineTo(-radius * 0.22, -radius * 0.58);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-radius * 0.2, -radius * 0.56);
  ctx.bezierCurveTo(
    -radius * 1.05,
    -radius * 0.35,
    -radius * 0.95,
    radius * 0.28,
    -radius * 0.72,
    radius * 0.4,
  );
  ctx.lineTo(radius * 0.72, radius * 0.4);
  ctx.bezierCurveTo(
    radius * 0.95,
    radius * 0.28,
    radius * 1.05,
    -radius * 0.35,
    radius * 0.2,
    -radius * 0.56,
  );
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(0, radius * 0.4, radius * 0.78, radius * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, radius * 0.64, radius * 0.14, 0, Math.PI * 2);
  ctx.fill();
}

function drawStar(ctx: CanvasRenderingContext2D, radius: number): void {
  starPath(ctx, radius * 0.95, radius * 0.4);
  const gradient = ctx.createLinearGradient(0, -radius, 0, radius);
  gradient.addColorStop(0, '#fff8df');
  gradient.addColorStop(0.5, '#ffd86a');
  gradient.addColorStop(1, '#e39b22');
  ctx.fillStyle = gradient;
  ctx.strokeStyle = '#a86b12';
  ctx.lineWidth = Math.max(1.5, radius * 0.04);
  ctx.lineJoin = 'round';
  ctx.fill();
  ctx.stroke();
}

function drawSeven(ctx: CanvasRenderingContext2D, radius: number): void {
  const gradient = ctx.createLinearGradient(0, -radius, 0, radius);
  gradient.addColorStop(0, '#ffd0b8');
  gradient.addColorStop(0.4, '#ff5a32');
  gradient.addColorStop(1, '#a91d22');
  ctx.font = `800 ${radius * 1.85}px Outfit, "Avenir Next", "Segoe UI", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = Math.max(1, radius * 0.06);
  ctx.strokeStyle = '#ffe7bf';
  ctx.fillStyle = gradient;
  ctx.strokeText('7', 0, radius * 0.08);
  ctx.fillText('7', 0, radius * 0.08);
}

function drawDiamond(ctx: CanvasRenderingContext2D, radius: number): void {
  const gradient = ctx.createLinearGradient(-radius, -radius, radius, radius);
  gradient.addColorStop(0, '#f4ffff');
  gradient.addColorStop(0.35, '#7ee7ff');
  gradient.addColorStop(0.7, '#2f8fd6');
  gradient.addColorStop(1, '#123a78');
  ctx.beginPath();
  ctx.moveTo(0, -radius * 0.95);
  ctx.lineTo(radius * 0.72, -radius * 0.18);
  ctx.lineTo(0, radius * 0.98);
  ctx.lineTo(-radius * 0.72, -radius * 0.18);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = Math.max(1, radius * 0.035);
  ctx.beginPath();
  ctx.moveTo(-radius * 0.72, -radius * 0.18);
  ctx.lineTo(0, -radius * 0.18);
  ctx.lineTo(radius * 0.72, -radius * 0.18);
  ctx.moveTo(0, -radius * 0.95);
  ctx.lineTo(0, radius * 0.98);
  ctx.moveTo(-radius * 0.36, -radius * 0.18);
  ctx.lineTo(0, radius * 0.98);
  ctx.moveTo(radius * 0.36, -radius * 0.18);
  ctx.lineTo(0, radius * 0.98);
  ctx.stroke();
}

function drawWild(ctx: CanvasRenderingContext2D, radius: number, time: number): void {
  const pulse = 0.5 + 0.5 * Math.sin(time * 3);
  const gradient = ctx.createRadialGradient(
    -radius * 0.2,
    -radius * 0.3,
    radius * 0.1,
    0,
    0,
    radius,
  );
  gradient.addColorStop(0, '#e9fff4');
  gradient.addColorStop(0.55, '#1fb87a');
  gradient.addColorStop(1, '#0c6b48');
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.9, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.lineWidth = Math.max(2, radius * 0.07);
  ctx.strokeStyle = `rgba(255, 226, 160, ${0.75 + pulse * 0.25})`;
  ctx.stroke();

  starPath(ctx, radius * 0.42, radius * 0.18);
  ctx.fillStyle = `rgba(255, 236, 190, ${0.35 + pulse * 0.25})`;
  ctx.fill();

  ctx.font = `700 ${radius * 0.38}px Outfit, "Avenir Next", "Segoe UI", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#f7fff9';
  ctx.fillText('WILD', 0, radius * 0.02);
}

function starPath(ctx: CanvasRenderingContext2D, outer: number, inner: number): void {
  ctx.beginPath();
  for (let point = 0; point < 10; point += 1) {
    const radius = point % 2 === 0 ? outer : inner;
    const angle = -Math.PI / 2 + (point * Math.PI) / 5;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (point === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function withAlpha(color: string, alpha: number): string {
  if (color.startsWith('#') && color.length === 7) {
    const red = Number.parseInt(color.slice(1, 3), 16);
    const green = Number.parseInt(color.slice(3, 5), 16);
    const blue = Number.parseInt(color.slice(5, 7), 16);
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  }
  return color;
}
