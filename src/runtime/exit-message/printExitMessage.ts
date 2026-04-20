import { clearExitMessage } from "../../extensions/exit-message/state/clearExitMessage.js";
import { getExitMessage } from "../../extensions/exit-message/state/getExitMessage.js";

/**
 * Prints the queued exit message after the TUI has shut down.
 *
 * @param write Output writer.
 * @returns True when a message was printed.
 */
export function printExitMessage(write: (text: string) => unknown = (text) => process.stdout.write(text)): boolean {
	const exitMessage = getExitMessage();
	clearExitMessage();
	if (!exitMessage) return false;
	write(`${exitMessage}\n`);
	return true;
}
