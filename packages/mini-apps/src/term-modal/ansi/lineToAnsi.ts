import { attrsEqual } from "./attrsEqual.js";
import { buildSgr } from "./buildSgr.js";
import { defaultAttrs } from "./defaultAttrs.js";
import type { CellAttrs } from "../types.js";

/**
 * Converts one xterm buffer line into ANSI-renderable text.
 *
 * @param line Xterm line object.
 * @param cell Shared null cell instance from xterm.
 * @returns ANSI string for the rendered line.
 */
export function lineToAnsi(line: any, cell: any): string {
	let result = "";
	let current = defaultAttrs();

	for (let index = 0; index < line.length; index += 1) {
		line.getCell(index, cell);
		if (cell.getWidth() === 0) continue;
		const next: CellAttrs = {
			fgDefault: cell.isFgDefault(),
			fgRGB: cell.isFgRGB(),
			fgPalette: cell.isFgPalette(),
			fgColor: cell.getFgColor(),
			bgDefault: cell.isBgDefault(),
			bgRGB: cell.isBgRGB(),
			bgPalette: cell.isBgPalette(),
			bgColor: cell.getBgColor(),
			bold: !!cell.isBold(),
			dim: !!cell.isDim(),
			italic: !!cell.isItalic(),
			underline: !!cell.isUnderline(),
			inverse: !!cell.isInverse(),
			strikethrough: !!cell.isStrikethrough(),
		};
		if (!attrsEqual(current, next)) {
			result += buildSgr(next);
			current = next;
		}
		result += cell.getChars() || " ";
	}

	if (!attrsEqual(current, defaultAttrs())) {
		result += "\x1b[0m";
	}
	return result.trimEnd();
}
