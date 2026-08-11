import { findText } from "./findText";

/**
 * Extracts the raw text from a user-message component.
 *
 * @param component User-message component.
 * @returns Raw message text.
 */
export function getRawText(component: unknown): string {
	return findText(component);
}
