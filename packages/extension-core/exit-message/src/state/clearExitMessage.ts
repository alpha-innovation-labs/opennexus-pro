import { exitMessageState } from "./exitMessageState";

/**
 * Clears the queued exit message.
 */
export function clearExitMessage(): void {
	exitMessageState.value = undefined;
}
