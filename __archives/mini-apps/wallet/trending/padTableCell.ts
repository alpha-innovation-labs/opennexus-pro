/**
 * Pads or truncates one table cell.
 *
 * @param value Cell text.
 * @param width Target cell width.
 * @param align Cell alignment.
 * @returns Fixed-width cell.
 */
export function padTableCell(value: string, width: number, align: "left" | "right" = "left"): string {
	const truncated = value.length > width ? value.slice(0, Math.max(0, width - 1)) + "…" : value;
	return align === "right" ? truncated.padStart(width) : truncated.padEnd(width);
}
