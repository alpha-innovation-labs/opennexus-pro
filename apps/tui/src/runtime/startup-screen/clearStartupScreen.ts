const CLEAR_STARTUP_SCREEN_SEQUENCE = "\x1b[2J\x1b[H\x1b[3J";

/**
 * Clears the current terminal viewport and scrollback before Nexus draws its first frame.
 *
 * @param output Writable stream used for terminal output.
 */
export function clearStartupScreen(output: {
	write(value: string): unknown;
}): void {
	output.write(CLEAR_STARTUP_SCREEN_SEQUENCE);
}
