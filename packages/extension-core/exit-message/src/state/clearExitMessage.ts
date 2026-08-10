import { exitMessageState } from "./exitMessageState.js";

/**
 * Clears the queued exit message.
 */
export function clearExitMessage(): void {
	exitMessageState.value = undefined;
}
