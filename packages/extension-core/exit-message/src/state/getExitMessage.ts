import { exitMessageState } from "./exitMessageState";

/**
 * Returns the queued exit message.
 *
 * @returns Exit message text when available.
 */
export function getExitMessage(): string | undefined {
	return exitMessageState.value;
}
