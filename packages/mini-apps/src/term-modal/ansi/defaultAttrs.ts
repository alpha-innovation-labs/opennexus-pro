import type { CellAttrs } from "../types.js";

/**
 * Returns default terminal cell attributes.
 *
 * @returns Default xterm cell style metadata.
 */
export function defaultAttrs(): CellAttrs {
	return {
		fgDefault: true,
		fgRGB: false,
		fgPalette: false,
		fgColor: -1,
		bgDefault: true,
		bgRGB: false,
		bgPalette: false,
		bgColor: -1,
		bold: false,
		dim: false,
		italic: false,
		underline: false,
		inverse: false,
		strikethrough: false,
	};
}
