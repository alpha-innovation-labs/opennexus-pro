/**
 * Checks whether a loader message is the main agent working indicator.
 *
 * @param message Loader message text.
 * @returns True when the message is the default working indicator.
 */
export function isWorkingLoaderMessage(message: string): boolean {
	return message.startsWith("Working...");
}
