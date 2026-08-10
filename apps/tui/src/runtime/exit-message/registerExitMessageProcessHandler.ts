import { printExitMessage } from "./printExitMessage";

let registered = false;

/**
 * Registers a process-exit handler that prints the queued exit message.
 */
export function registerExitMessageProcessHandler(): void {
	if (registered) return;
	registered = true;
	process.once("exit", () => {
		printExitMessage();
	});
}
