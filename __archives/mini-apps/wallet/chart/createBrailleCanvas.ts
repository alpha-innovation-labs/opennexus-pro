/**
 * Creates a blank braille pixel canvas.
 *
 * @param width Character width.
 * @param height Character height.
 * @returns Braille pixel canvas.
 */
export function createBrailleCanvas(width: number, height: number): boolean[][] {
	return Array.from({ length: height * 4 }, () => Array.from({ length: width * 2 }, () => false));
}
