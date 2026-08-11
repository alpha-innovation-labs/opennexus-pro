export function stripAnsi(text: string): string {
	return text
		.split("")
		.filter((c) => c !== "\x1B")
		.join("");
}
