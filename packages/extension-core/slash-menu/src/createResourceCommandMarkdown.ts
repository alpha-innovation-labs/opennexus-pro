import { readResourceCommandMarkdown } from "./readResourceCommandMarkdown";
import type { SlashMenuLeaf, SlashMenuSection } from "./types";

/**
 * Creates markdown details for a prompt or skill command.
 *
 * @param item Resource command item.
 * @returns Markdown preview content.
 */
export function createResourceCommandMarkdown(
	item: SlashMenuLeaf | SlashMenuSection,
): string {
	const source = readResourceCommandMarkdown(
		(item as { sourcePath?: string }).sourcePath,
	);
	if (source !== undefined) return source;
	return `# ${item.label}\n\nSource file unavailable.`;
}
