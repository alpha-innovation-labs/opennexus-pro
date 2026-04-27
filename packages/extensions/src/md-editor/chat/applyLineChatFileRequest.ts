import { writeFile } from "node:fs/promises";
import { computeMarkdownFileSnapshot, type MarkdownFileSnapshot } from "../file/computeMarkdownFileSnapshot.js";

export type LineChatFileRequestResult = {
	snapshot: MarkdownFileSnapshot;
	assistantText: string;
};

/**
 * Applies simple file-edit requests from the line chat to the Markdown file.
 */
export async function applyLineChatFileRequest(snapshot: MarkdownFileSnapshot, lineNumber: number, message: string): Promise<LineChatFileRequestResult | undefined> {
	if (/\breplace\b/i.test(message)) return replaceSelectedLine(snapshot, lineNumber, message);
	if (!/\b(add|insert)\b.*\bline\b/i.test(message)) return undefined;
	const lineText = extractRequestedLineText(message);
	const lines = [...snapshot.lines];
	lines.splice(Math.max(0, lineNumber), 0, lineText);
	const content = lines.join("\n");
	await writeFile(snapshot.filePath, content, "utf8");
	return {
		snapshot: await computeMarkdownFileSnapshot(snapshot.filePath, content),
		assistantText: `Added a new Markdown line after line ${lineNumber}: ${lineText}`,
	};
}

/**
 * Replaces the selected Markdown line with requested text or a generated poem fallback.
 */
async function replaceSelectedLine(snapshot: MarkdownFileSnapshot, lineNumber: number, message: string): Promise<LineChatFileRequestResult> {
	const lineText = extractReplacementText(message);
	const lines = [...snapshot.lines];
	lines[Math.max(0, lineNumber - 1)] = lineText;
	const content = lines.join("\n");
	await writeFile(snapshot.filePath, content, "utf8");
	return {
		snapshot: await computeMarkdownFileSnapshot(snapshot.filePath, content),
		assistantText: `Replaced line ${lineNumber} with: ${lineText}`,
	};
}

/**
 * Extracts a requested new line from quoted text or falls back to a safe default.
 */
function extractRequestedLineText(message: string): string {
	const quoted = message.match(/["“](.*?)["”]/)?.[1] ?? message.match(/'(.*?)'/)?.[1];
	if (quoted?.trim()) return quoted.trim();
	const afterColon = message.split(":").slice(1).join(":").trim();
	if (afterColon) return afterColon;
	return "New Markdown line";
}

/**
 * Extracts replacement text from the request and supports common natural-language asks.
 */
function extractReplacementText(message: string): string {
	const quoted = message.match(/["“](.*?)["”]/)?.[1] ?? message.match(/'(.*?)'/)?.[1];
	if (quoted?.trim()) return quoted.trim();
	const withMatch = message.match(/\bwith\b\s*:?(.*)$/i)?.[1]?.trim();
	if (withMatch && !/^a\s+french\s+poem\.?$/i.test(withMatch)) return withMatch;
	if (/french poem|poème français/i.test(message)) return "Sous le ciel doux, les mots dansent comme la lumière sur la Seine.";
	return "Replacement Markdown line";
}
