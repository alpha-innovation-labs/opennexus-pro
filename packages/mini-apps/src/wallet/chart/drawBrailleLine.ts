/**
 * Draws a line into a braille pixel canvas.
 *
 * @param canvas Braille pixel canvas.
 * @param x0 Start x coordinate.
 * @param y0 Start y coordinate.
 * @param x1 End x coordinate.
 * @param y1 End y coordinate.
 */
export function drawBrailleLine(canvas: boolean[][], x0: number, y0: number, x1: number, y1: number): void {
	const dx = Math.abs(x1 - x0);
	const dy = -Math.abs(y1 - y0);
	const sx = x0 < x1 ? 1 : -1;
	const sy = y0 < y1 ? 1 : -1;
	let error = dx + dy;
	let x = x0;
	let y = y0;
	for (;;) {
		canvas[y]![x] = true;
		if (x === x1 && y === y1) return;
		const doubled = 2 * error;
		if (doubled >= dy) { error += dy; x += sx; }
		if (doubled <= dx) { error += dx; y += sy; }
	}
}
