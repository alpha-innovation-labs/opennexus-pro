import type { SystemPromptOutlineChild } from "./types.js";

/**
 * Creates an outline child when its source line exists.
 *
 * @param label Display label.
 * @param lineIndex Source prompt line index.
 * @returns Outline child, or undefined when missing.
 */
export function createPromptSectionChild(label: string, lineIndex: number): SystemPromptOutlineChild | undefined {
	if (lineIndex < 0) return undefined;
	return { label, lineIndex };
}
