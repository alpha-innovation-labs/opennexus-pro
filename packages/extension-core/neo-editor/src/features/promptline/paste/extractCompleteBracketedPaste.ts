export interface CompleteBracketedPaste {
	before: string;
	content: string;
	after: string;
}

const BRACKETED_PASTE_START = "\x1b[200~";
const BRACKETED_PASTE_END = "\x1b[201~";

/**
 * Extracts one complete bracketed paste payload from a raw terminal input chunk.
 *
 * @param data Raw terminal input chunk.
 * @returns Paste payload parts when the chunk contains a complete bracketed paste.
 */
export function extractCompleteBracketedPaste(
	data: string,
): CompleteBracketedPaste | undefined {
	const startIndex = data.indexOf(BRACKETED_PASTE_START);
	if (startIndex === -1) return undefined;
	const contentStart = startIndex + BRACKETED_PASTE_START.length;
	const endIndex = data.indexOf(BRACKETED_PASTE_END, contentStart);
	if (endIndex === -1) return undefined;
	return {
		before: data.slice(0, startIndex),
		content: data.slice(contentStart, endIndex),
		after: data.slice(endIndex + BRACKETED_PASTE_END.length),
	};
}
