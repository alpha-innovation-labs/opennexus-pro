export type MarkdownDiffToken = {
	kind: "unchanged" | "added" | "removed";
	text: string;
};

/**
 * Computes a deterministic word-level diff between accepted and current Markdown content.
 */
export function trackMarkdownDiff(previous: string, next: string): MarkdownDiffToken[] {
	const oldWords = previous.split(/(\s+)/).filter(Boolean);
	const newWords = next.split(/(\s+)/).filter(Boolean);
	const tokens: MarkdownDiffToken[] = [];
	let i = 0;
	let j = 0;
	while (i < oldWords.length || j < newWords.length) {
		if (oldWords[i] === newWords[j]) {
			tokens.push({ kind: "unchanged", text: newWords[j] });
			i += 1;
			j += 1;
		} else if (newWords[j] && !oldWords.slice(i, i + 4).includes(newWords[j])) {
			tokens.push({ kind: "added", text: newWords[j] });
			j += 1;
		} else if (oldWords[i]) {
			tokens.push({ kind: "removed", text: oldWords[i] });
			i += 1;
		} else if (newWords[j]) {
			tokens.push({ kind: "added", text: newWords[j] });
			j += 1;
		}
	}
	return tokens;
}
