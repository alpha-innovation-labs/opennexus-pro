import type { BrailleCanvas } from "./createBrailleCanvas.js";

const BRAILLE_DOTS = [
  [0x01, 0x08],
  [0x02, 0x10],
  [0x04, 0x20],
  [0x40, 0x80],
];

/**
 * Renders a braille pixel canvas as terminal text rows.
 *
 * @param canvas Braille pixel canvas.
 * @returns Braille chart rows.
 */
export function renderBrailleCanvas(canvas: BrailleCanvas): string[] {
  const rows: string[] = [];
  const pixelHeight = canvas.length;
  const pixelWidth = canvas[0]?.length ?? 0;
  for (let y = 0; y < pixelHeight; y += 4) {
    let line = "";
    for (let x = 0; x < pixelWidth; x += 2) {
      line += String.fromCharCode(0x2800 + getBrailleMask(canvas, x, y));
    }
    rows.push(line);
  }
  return rows;
}

/**
 * Computes the braille bit mask for one character cell.
 *
 * @param canvas Braille pixel canvas.
 * @param x Cell pixel x.
 * @param y Cell pixel y.
 * @returns Braille bit mask.
 */
function getBrailleMask(canvas: BrailleCanvas, x: number, y: number): number {
  let mask = 0;
  for (let dy = 0; dy < 4; dy += 1) {
    for (let dx = 0; dx < 2; dx += 1) {
      if (canvas[y + dy]?.[x + dx]) mask |= BRAILLE_DOTS[dy]![dx]!;
    }
  }
  return mask;
}
