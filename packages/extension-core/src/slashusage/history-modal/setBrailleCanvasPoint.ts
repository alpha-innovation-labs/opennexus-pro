import type { BrailleCanvas } from "./createBrailleCanvas.js";

/**
 * Sets one pixel on a braille canvas.
 *
 * @param canvas Braille pixel canvas.
 * @param x Pixel x coordinate.
 * @param y Pixel y coordinate.
 */
export function setBrailleCanvasPoint(canvas: BrailleCanvas, x: number, y: number): void {
  const row = canvas[y];
  if (!row || x < 0 || x >= row.length) return;
  row[x] = true;
}
