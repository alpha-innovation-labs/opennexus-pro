import { execFileSync } from "node:child_process";

const CLIPBOARD_TIMEOUT_MS = 2000;

/**
 * Copies text to the system clipboard using a platform clipboard binary.
 *
 * The write is synchronous so it completes before the app restores the
 * terminal. It tries candidate commands in order and stops at the first that
 * succeeds. Failures (missing binary, no display, etc.) are swallowed.
 *
 * @param text Text to copy.
 * @returns True when the clipboard write succeeded.
 */
export function copyTextToClipboard(text: string): boolean {
	for (const [command, args] of getClipboardCommands(process.platform)) {
		try {
			execFileSync(command, args, {
				input: text,
				timeout: CLIPBOARD_TIMEOUT_MS,
				stdio: "pipe",
			});
			return true;
		} catch {
			// Try the next candidate command.
		}
	}
	return false;
}

/**
 * Returns ordered clipboard write commands for a platform.
 *
 * @param platform Node platform id.
 * @returns List of [command, args] to try in order.
 */
function getClipboardCommands(
	platform: string,
): Array<[command: string, args: string[]]> {
	if (platform === "darwin") return [["pbcopy", []]];
	if (platform === "win32") return [["clip", []]];
	return [
		["wl-copy", []],
		["xclip", ["-selection", "clipboard"]],
		["xsel", ["--clipboard", "--input"]],
	];
}
