/**
 * Normalizes a configured shell command into PTY input bytes.
 *
 * @param command Shell command to send.
 * @returns PTY input string.
 */
export function toTerminalCommandInput(command: string): string {
	return `${command.replace(/[\r\n]+$/g, "") || command}\r`;
}
