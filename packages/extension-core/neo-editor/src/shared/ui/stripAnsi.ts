const ansiRegex = new RegExp(`\x1b\\[[0-9;]*m`, "g");

export function stripAnsi(text: string): string {
	return text.replace(ansiRegex, "");
}
