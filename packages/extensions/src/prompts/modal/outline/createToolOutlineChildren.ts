import { getNativeSystemToolNames } from "../tools/getNativeSystemToolNames.js";
import type { SystemPromptOutlineChild } from "./types.js";

/**
 * Returns native system tool rows for the /SystemPrompt Tools section.
 *
 * @param lines Prompt lines.
 * @returns Tool outline children.
 */
export function createToolOutlineChildren(lines: readonly string[]): SystemPromptOutlineChild[] {
	const startIndex = lines.findIndex((line) => line.trim() === "Available tools:");
	if (startIndex < 0) return [];
	return getNativeSystemToolNames().map((label, index) => ({ label, lineIndex: startIndex + 1 + index }));
}
