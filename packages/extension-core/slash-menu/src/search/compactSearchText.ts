import { normalizeSearchText } from "./normalizeSearchText";

/**
 * Removes separator spaces from normalized search text for compact matching.
 *
 * @param text Raw text to compact.
 * @returns Lowercase alphanumeric search text.
 */
export function compactSearchText(text: string): string {
	return normalizeSearchText(text).replace(/\s+/gu, "");
}
