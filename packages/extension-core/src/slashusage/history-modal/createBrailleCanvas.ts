/** Braille canvas used to render dense terminal charts. */
export type BrailleCanvas = boolean[][];

/**
 * Creates an empty pixel canvas for braille rendering.
 *
 * @param width Braille cell width.
 * @param height Braille cell height.
 * @returns Empty pixel canvas.
 */
export function createBrailleCanvas(width: number, height: number): BrailleCanvas {
  return Array.from({ length: height * 4 }, () => Array.from({ length: width * 2 }, () => false));
}
