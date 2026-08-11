export function stripAnsi(text: string): string {
	return text.replace(/\033\[[0-9;]*m/g, "");
}
