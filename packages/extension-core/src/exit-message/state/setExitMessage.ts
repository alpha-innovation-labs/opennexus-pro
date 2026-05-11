import { exitMessageState } from "./exitMessageState.js";

/**
 * Stores the exit message to print after the app restores the terminal.
 *
 * @param value Exit message text.
 */
export function setExitMessage(value: string): void {
	exitMessageState.value = value;
}
