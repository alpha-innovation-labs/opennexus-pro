import type { SelectPreviewTheme } from "@nexus/tui-kit/modal/index";
import { renderOutlineConnector } from "./renderOutlineConnector";
import type { SystemPromptOutline } from "./types";

/**
 * Renders system prompt outline rows for the left pane.
 *
 * @param outline Parsed prompt outline.
 * @param theme Modal theme.
 * @returns Renderable outline lines.
 */
export function renderSystemPromptOutline(
	outline: SystemPromptOutline,
	theme: SelectPreviewTheme,
): string[] {
	const lines: string[] = [];
	for (const [sectionIndex, section] of outline.sections.entries()) {
		const sectionLast = sectionIndex === outline.sections.length - 1;
		lines.push(theme.fg("accent", section.label));
		for (const [childIndex, child] of section.children.entries()) {
			const connector = renderOutlineConnector(
				childIndex === section.children.length - 1,
			);
			lines.push(
				`${theme.fg("dim", sectionLast ? "  " : "│ ")}${theme.fg("dim", connector)} ${child.label}`,
			);
		}
	}
	return lines;
}
