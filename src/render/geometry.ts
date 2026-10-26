/** Vertical center of a symbol. `position` is the strip index on the middle row. */
export function symbolCenterY(
  middleY: number,
  cellH: number,
  position: number,
  index: number,
): number {
  return middleY + (position - index) * cellH;
}

/** Vertical center of a fixed window row. Row 0 is the top. */
export function rowCenterY(reelTop: number, cellH: number, row: number): number {
  return reelTop + (row + 0.5) * cellH;
}

/** Rounded rectangle path. The caller fills or strokes it. */
export function traceRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}
