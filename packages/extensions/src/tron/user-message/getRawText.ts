import { findText } from "./findText.ts";

/**
 * Extracts the raw text from a user-message component.
 *
 * @param component User-message component.
 * @returns Raw message text.
 */
export function getRawText(component: any): string {
	return findText(component);
}
