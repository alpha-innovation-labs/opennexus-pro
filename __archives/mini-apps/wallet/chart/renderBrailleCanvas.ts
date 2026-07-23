const BRAILLE_DOTS = [0x01, 0x08, 0x02, 0x10, 0x04, 0x20, 0x40, 0x80];

/**
 * Renders a braille pixel canvas as terminal rows.
 *
 * @param canvas Braille pixel canvas.
 * @returns Braille chart rows.
 */
export function renderBrailleCanvas(canvas: boolean[][]): string[] {
	const rows: string[] = [];
	for (let y = 0; y < canvas.length; y += 4) {
		let row = "";
		for (let x = 0; x < (canvas[y]?.length ?? 0); x += 2) {
			let mask = 0;
			for (let py = 0; py < 4; py += 1) {
				for (let px = 0; px < 2; px += 1) {
					if (canvas[y + py]?.[x + px]) mask |= BRAILLE_DOTS[py * 2 + px] ?? 0;
				}
			}
			row += String.fromCharCode(0x2800 + mask);
		}
		rows.push(row);
	}
	return rows;
}
