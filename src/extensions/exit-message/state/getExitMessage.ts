import { exitMessageState } from "./exitMessageState.js";

/**
 * Returns the queued exit message.
 *
 * @returns Exit message text when available.
 */
export function getExitMessage(): string | undefined {
	return exitMessageState.value;
}
