import type { CellAttrs } from "../types.js";

/**
 * Builds ANSI SGR escape codes for a cell attribute set.
 *
 * @param attrs Cell attributes to encode.
 * @returns ANSI escape sequence for the provided attributes.
 */
export function buildSgr(attrs: CellAttrs): string {
	const codes: number[] = [0];
	if (attrs.bold) codes.push(1);
	if (attrs.dim) codes.push(2);
	if (attrs.italic) codes.push(3);
	if (attrs.underline) codes.push(4);
	if (attrs.inverse) codes.push(7);
	if (attrs.strikethrough) codes.push(9);
	if (!attrs.fgDefault) {
		if (attrs.fgRGB) {
			codes.push(38, 2, (attrs.fgColor >> 16) & 0xff, (attrs.fgColor >> 8) & 0xff, attrs.fgColor & 0xff);
		} else if (attrs.fgPalette) {
			if (attrs.fgColor < 8) codes.push(30 + attrs.fgColor);
			else if (attrs.fgColor < 16) codes.push(90 + (attrs.fgColor - 8));
			else codes.push(38, 5, attrs.fgColor);
		}
	}
	if (!attrs.bgDefault) {
		if (attrs.bgRGB) {
			codes.push(48, 2, (attrs.bgColor >> 16) & 0xff, (attrs.bgColor >> 8) & 0xff, attrs.bgColor & 0xff);
		} else if (attrs.bgPalette) {
			if (attrs.bgColor < 8) codes.push(40 + attrs.bgColor);
			else if (attrs.bgColor < 16) codes.push(100 + (attrs.bgColor - 8));
			else codes.push(48, 5, attrs.bgColor);
		}
	}
	return `\x1b[${codes.join(";")}m`;
}
