import { createSystemPromptOutline } from "./createSystemPromptOutline";
import type { SystemPromptOutlineChild, SystemPromptOutlineSection } from "./types";

export type SystemPromptOutlineRow = {
	label: string;
	lineIndex: number;
	level: 0 | 1;
	selectable: boolean;
	section: SystemPromptOutlineSection;
	child?: SystemPromptOutlineChild;
	isLastChild?: boolean;
};

/**
 * Flattens the system prompt outline into selectable/renderable rows.
 *
 * @param prompt Effective system prompt text.
 * @returns Outline rows in display order.
 */
export function createSystemPromptOutlineRows(prompt: string): SystemPromptOutlineRow[] {
	const outline = createSystemPromptOutline(prompt);
	return outline.sections.flatMap((section) => [
		{ label: section.label, lineIndex: section.lineIndex, level: 0 as const, selectable: false, section },
		...section.children.map((child, index) => ({
			label: child.label,
			lineIndex: child.lineIndex,
			level: 1 as const,
			selectable: true,
			section,
			child,
			isLastChild: index === section.children.length - 1,
		})),
	]);
}
