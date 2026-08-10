import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

/**
 * Reads the user-visible promptline session name without inventing a placeholder.
 *
 * @param getSessionName Pi session name getter.
 * @returns Trimmed session name, or undefined when no name exists.
 */
export function getVisiblePromptlineSessionName(getSessionName: ExtensionAPI["getSessionName"]): string | undefined {
	const sessionName = getSessionName()?.trim();
	return sessionName ? sessionName : undefined;
}
