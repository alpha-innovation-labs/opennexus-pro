/**
 * Removes ANSI escape sequences from rendered text for width-safe composition.
 *
 * @param value Text that may contain ANSI escapes.
 * @returns Plain text without ANSI sequences.
 */
export function stripTetrisAnsi(value: string): string {
	return value.replace(/\x1b\[[0-9;]*m/gu, "");
}
