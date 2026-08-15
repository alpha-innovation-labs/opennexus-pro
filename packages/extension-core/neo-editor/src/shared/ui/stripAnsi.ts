/* eslint-disable no-control-regex */
// Build regex dynamically to avoid literal escape character in source
const ESCAPE = String.fromCharCode(27);
const ansiRegex = new RegExp(`${ESCAPE}\\[[0-9;]*m`, 'g');

export function stripAnsi(text: string): string {
	return text.replace(ansiRegex, "");
}
