import { registeredShortcuts } from "./state";

/**
 * Records one registered shortcut for help-modal rendering.
 *
 * @param shortcut Registered shortcut id.
 * @param definition Shortcut definition passed to Pi.
 */
export function recordRegisteredShortcut(
	shortcut: string,
	definition: Record<string, unknown>,
): void {
	const description =
		typeof definition.description === "string"
			? definition.description
			: shortcut;
	registeredShortcuts.push({ shortcut, description });
}
