import { compactSearchText } from "./compactSearchText";
import { doesCompactSearchTokenMatch } from "./doesCompactSearchTokenMatch";
import { doesSearchTokenMatch } from "./doesSearchTokenMatch";
import { normalizeSearchText } from "./normalizeSearchText";

/**
 * Checks whether every search token appears somewhere in an item's searchable text.
 *
 * @param label Item label.
 * @param value Item value.
 * @param tokens Normalized query tokens.
 * @returns True when all tokens match label or value text.
 */
export function doesSearchQueryMatch(
	label: string,
	value: string,
	tokens: string[],
): boolean {
	const text = normalizeSearchText(`${label} ${value}`);
	const compactValue = compactSearchText(value);
	return tokens.every(
		(token) =>
			doesSearchTokenMatch(text, token) ||
			compactValue.includes(compactSearchText(token)) ||
			doesCompactSearchTokenMatch(label, token),
	);
}
