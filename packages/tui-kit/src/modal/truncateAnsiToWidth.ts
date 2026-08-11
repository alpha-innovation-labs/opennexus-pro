import { visibleWidth } from "@earendil-works/pi-tui";

const escapeChar = "\x1B";
const ansiPattern = new RegExp(`${escapeChar}\\[[0-9;]*m`, "uy");

/** Truncates a string containing ANSI SGR escape sequences to a visible width. */
export function truncateAnsiToWidth(value: string, width: number): string {
	const targetWidth = Math.max(0, Math.floor(width));
	if (targetWidth === 0) return "";
	let output = "";
	let visible = 0;
	for (let index = 0; index < value.length; ) {
		ansiPattern.lastIndex = index;
		const ansi = ansiPattern.exec(value);
		if (ansi?.index === index) {
			output += ansi[0];
			index += ansi[0].length;
			continue;
		}
		const char = value[index] ?? "";
		const charWidth = visibleWidth(char);
		if (visible + charWidth > targetWidth) break;
		output += char;
		visible += charWidth;
		index += char.length;
	}
	return output;
}
