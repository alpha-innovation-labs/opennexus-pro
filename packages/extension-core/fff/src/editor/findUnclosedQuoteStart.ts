/**
 * Finds the start of the last unclosed double-quoted segment.
 *
 * @param text Current text before the cursor.
 * @returns Quote start index or null.
 */
export function findUnclosedQuoteStart(text: string): number | null {
	let inQuotes = false;
	let quoteStart = -1;
	for (let index = 0; index < text.length; index += 1) {
		if (text[index] !== '"') continue;
		inQuotes = !inQuotes;
		if (inQuotes) quoteStart = index;
	}
	return inQuotes ? quoteStart : null;
}
