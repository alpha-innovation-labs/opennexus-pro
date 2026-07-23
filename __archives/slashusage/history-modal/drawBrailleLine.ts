import type { BrailleCanvas } from "./createBrailleCanvas.js";
import { setBrailleCanvasPoint } from "./setBrailleCanvasPoint.js";

/**
 * Draws a connected line segment on a braille canvas.
 *
 * @param canvas Braille pixel canvas.
 * @param x0 Start x.
 * @param y0 Start y.
 * @param x1 End x.
 * @param y1 End y.
 */
export function drawBrailleLine(canvas: BrailleCanvas, x0: number, y0: number, x1: number, y1: number): void {
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let error = dx + dy;
  let x = x0;
  let y = y0;

  while (true) {
    setBrailleCanvasPoint(canvas, x, y);
    if (x === x1 && y === y1) return;
    const nextError = 2 * error;
    if (nextError >= dy) {
      error += dy;
      x += sx;
    }
    if (nextError <= dx) {
      error += dx;
      y += sy;
    }
  }
}
