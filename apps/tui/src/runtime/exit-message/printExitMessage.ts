import { clearExitMessage } from "@extensions/exit-message";
import { getExitMessage } from "@extensions/exit-message";

/**
 * Prints the queued exit message after the TUI has shut down.
 *
 * @param write Output writer.
 * @returns True when a message was printed.
 */
export function printExitMessage(
	write: (text: string) => unknown = (text) => process.stdout.write(text),
): boolean {
	const exitMessage = getExitMessage();
	clearExitMessage();
	if (!exitMessage) return false;
	write(`\n${exitMessage}\n`);
	return true;
}
