/**
 * Creates blank modal body rows used to fill fullscreen modal height.
 *
 * @param count Number of empty rows.
 * @param innerWidth Width between modal borders.
 * @param borderColor Function that colors border text.
 * @returns Empty bordered modal rows.
 */
export function createEmptyModalRows(
	count: number,
	innerWidth: number,
	borderColor: (value: string) => string,
): string[] {
	return Array.from(
		{ length: Math.max(0, count) },
		() => `${borderColor("│")}${" ".repeat(innerWidth)}${borderColor("│")}`,
	);
}
