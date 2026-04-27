import type { CellAttrs } from "../types.js";

/**
 * Compares two xterm cell attribute objects.
 *
 * @param left First cell attributes.
 * @param right Second cell attributes.
 * @returns True when both attribute sets are identical.
 */
export function attrsEqual(left: CellAttrs, right: CellAttrs): boolean {
	return (
		left.fgDefault === right.fgDefault &&
		left.fgRGB === right.fgRGB &&
		left.fgPalette === right.fgPalette &&
		left.fgColor === right.fgColor &&
		left.bgDefault === right.bgDefault &&
		left.bgRGB === right.bgRGB &&
		left.bgPalette === right.bgPalette &&
		left.bgColor === right.bgColor &&
		left.bold === right.bold &&
		left.dim === right.dim &&
		left.italic === right.italic &&
		left.underline === right.underline &&
		left.inverse === right.inverse &&
		left.strikethrough === right.strikethrough
	);
}
