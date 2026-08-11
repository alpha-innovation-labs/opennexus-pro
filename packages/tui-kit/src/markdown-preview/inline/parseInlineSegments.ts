import type { MarkdownInlineSegment } from "../types";

const inlinePattern =
	/(\*\*\*([^*]+)\*\*\*|\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|~~([^~]+)~~|\[([^\]]+)\]\(([^)]+)\))/gu;

/** Parses Ratkit-supported inline markdown into styled text segments. */
export function parseInlineSegments(markdown: string): MarkdownInlineSegment[] {
	const segments: MarkdownInlineSegment[] = [];
	let cursor = 0;

	for (const match of markdown.matchAll(inlinePattern)) {
		const index = match.index ?? 0;
		if (index > cursor)
			segments.push({ kind: "plain", text: markdown.slice(cursor, index) });
		segments.push(createInlineSegment(match));
		cursor = index + match[0].length;
	}

	if (cursor < markdown.length)
		segments.push({ kind: "plain", text: markdown.slice(cursor) });
	return segments;
}

/** Converts one regex match into a markdown inline segment. */
function createInlineSegment(match: RegExpMatchArray): MarkdownInlineSegment {
	if (match[2] !== undefined) return { kind: "strongEmphasis", text: match[2] };
	if (match[3] !== undefined) return { kind: "strong", text: match[3] };
	if (match[4] !== undefined) return { kind: "emphasis", text: match[4] };
	if (match[5] !== undefined) return { kind: "inlineCode", text: match[5] };
	if (match[6] !== undefined) return { kind: "strikethrough", text: match[6] };
	return { kind: "link", text: match[7] ?? "", url: match[8] ?? "" };
}
